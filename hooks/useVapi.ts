import {
  Message,
  MessageRoleEnum,
  MessageTypeEnum,
  TranscriptMessageTypeEnum,
} from "@/utils/conversation.types";
import Vapi from "@vapi-ai/react-native";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "patients-overrides-v1";

// choose a stable key (best = an id). For now, use patientName.

const key = process.env.EXPO_PUBLIC_VAPI_KEY as string;
const vapi = new Vapi(key);

export enum CALL_STATUS {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

// ---------- NEW: case context + options ----------
type CaseContext = {
  patientName?: string;
  age?: number | string;
  sex?: string;
  summary?: string;
  callerName?: string;
};

type StartCallOptions = {
  caseContext?: CaseContext;
  firstMessageOverride?: string; // optional
};

const patientKeyFromCtx = (ctx?: CaseContext) =>
  (ctx?.patientName || ctx?.patient_name || "").trim();

async function mergePatientOverride(
  patientKey: string,
  patch: Record<string, any>
) {
  if (!patientKey) return;
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const all = raw ? JSON.parse(raw) : {};

  const safePatch = { ...patch };
  if (!safePatch.final_summary || !String(safePatch.final_summary).trim()) {
    delete safePatch.final_summary; // prevent null/empty saves
  }

  all[patientKey] = { ...(all[patientKey] || {}), ...safePatch };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

async function debugLogOverrides() {
  const raw = await AsyncStorage.getItem("patients-overrides-v1");
  // console.log("overrides@AsyncStorage =", raw ? JSON.parse(raw) : {});
}

// Optional: default settings if none are saved yet
const DEFAULT_SETTINGS = {
  systemPrompt: "You are a helpful AI assistant.",
  modelProvider: "openai",
  modelName: "gpt-4o",
  voiceProvider: "11labs",
  voiceId: "pNInz6obpgDQGcFmaJgB",
  firstMessage: "Hello! How can I help you today?",
};

// ---------- NEW: tiny template filler for {{tokens}} ----------
// Accept many aliases for the same thing
const fillPrompt = (template: string, ctx?: CaseContext) => {
  if (!template || !ctx) return template;
  const S = (v: any) => (v === undefined || v === null ? "" : String(v));
  // console.log("ctx:", ctx);
  const values = {
    caller_name: S(ctx.callerName),
    patient_name: S(ctx.patientName),
    age: S(ctx.age),
    sex: S(ctx.sex),
    case_summary: S(ctx.summary),
  };

  // aliases -> canonical keys
  const aliasToKey: Record<string, keyof typeof values> = {
    caller_name: "caller_name",
    doctor_name: "caller_name",
    clinician_name: "caller_name",

    patient_name: "patient_name",
    name: "patient_name",

    age: "age",
    patient_age: "age",
    years_old: "age",

    sex: "sex",
    gender: "sex",
    patient_sex: "sex",

    case_summary: "case_summary",
    case_history: "case_summary",
    history: "case_summary",
    summary: "case_summary",
    chief_complaint: "case_summary",
    complaint: "case_summary",
    case: "case_summary",
  };

  return template.replace(
    /\{\{\s*([a-zA-Z_]+)\s*\}\}/g,
    (_m, keyRaw: string) => {
      const key = keyRaw as keyof typeof aliasToKey;
      const mapped = aliasToKey[key];
      return mapped ? values[mapped] : "";
    }
  );
};
const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || "http://172.21.14.154:8080";
export function useVapi() {
  // add state
  const [lastError, setLastError] = useState<string | null>(null);

  const [callStatus, setCallStatus] = useState<CALL_STATUS>(
    CALL_STATUS.INACTIVE
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // prevent double-starts
  const [finalSummary, setFinalSummary] = useState<string | null>(null);
  const isStartingRef = useRef(false);
  //live ref for messages
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // new:
  // console.log("the actual messages in useVapi", messages);
  const buildTranscript = (msgs: Message[]) => {
    return msgs
      .filter((m) => m.type === MessageTypeEnum.TRANSCRIPT)
      .map(
        (m) =>
          `${m.role === "user" ? "Doctor" : "Assistant"}: ${m.transcript ?? ""}`
      )
      .join("\n");
  };

  const lastCaseContextRef = useRef<CaseContext | undefined>(undefined);

  useEffect(() => {
    const onCallStartHandler = () => setCallStatus(CALL_STATUS.ACTIVE);

    const onCallEnd = async () => {
      setCallStatus(CALL_STATUS.FINISHED);
      await new Promise((r) => setTimeout(r, 200));
      const transcript = buildTranscript(messagesRef.current);
      console.log("Built transcript length:", transcript.length);
      console.log("Built transcript preview:\n", transcript.slice(0, 300));
      if (!transcript.trim()) {
        console.warn("No transcript to summarize — skipping.");
        return;
      }

      try {
        // const transcript = buildTranscript(messages);
        console.log("the message for summary", transcript);
        const response = await fetch(`${API_BASE}/summarize`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transcript,
            caseContext: lastCaseContextRef.current,
          }),
        });
        const json = await response.json();
        if (json?.ok && json?.pretty_text) {
          const generatedSummary = json.pretty_text; // <- use local var
          setFinalSummary(generatedSummary);
          // setFinalSummary(json.pretty_text);

          // console.log("Final summary received:", generatedSummary);
          const patientKey = patientKeyFromCtx(lastCaseContextRef.current);
          await mergePatientOverride(patientKey, {
            final_summary: generatedSummary,
            date_modified: new Date().toISOString(),
          });
          await debugLogOverrides();
          // console.log("Final summary received:", json.pretty_text);
        } else {
          console.warn("Summarize response not ok:", json);
        }
      } catch (error) {
        console.error("Summary failed:", error);
      }
    };
    const onMessageUpdate = (message: Message) => {
      if (
        message.type === MessageTypeEnum.TRANSCRIPT &&
        message.transcriptType === TranscriptMessageTypeEnum.FINAL
      ) {
        setMessages((prev) => [...prev, message]);
        // console.log("Final message received:", message);
      }
    };

    const onError = async (e: any) => {
      try {
        if (typeof e === "string") setLastError(e);
        else if (e?.error)
          setLastError(
            typeof e.error === "string" ? e.error : JSON.stringify(e.error)
          );
        else if (e?.text) setLastError(await e.text());
        else if (e?._bodyInit || e?._bodyBlob) {
          // some fetch-like errors carry a response body
          const t = await (e.text?.() ?? Promise.resolve(""));
          setLastError(t || JSON.stringify(e));
        } else setLastError(JSON.stringify(e));
      } catch {
        setLastError(String(e));
      }
      setCallStatus(CALL_STATUS.INACTIVE);
      console.error("Vapi error:", e);
    };
    // const onError = (e: any) => {
    //   setCallStatus(CALL_STATUS.INACTIVE);
    //   console.error("Vapi error:", e);
    // };

    vapi.on("call-start", onCallStartHandler);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessageUpdate);
    vapi.on("error", onError);
    vapi.on("speech-start", () => setIsSpeaking(true));
    vapi.on("speech-end", () => setIsSpeaking(false));

    return () => {
      vapi.off("call-start", onCallStartHandler);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessageUpdate);
      vapi.off("error", onError);
      vapi.off("speech-start", () => setIsSpeaking(true));
      vapi.off("speech-end", () => setIsSpeaking(false));
    };
  }, []);

  // ---------- CHANGED: accepts opts, fills placeholders ----------
  const startCall = async (opts?: StartCallOptions) => {
    // setFinalSummary(null);
    setFinalSummary(null); // reset for new call
    lastCaseContextRef.current = opts?.caseContext;
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCallStatus(CALL_STATUS.CONNECTING);

    // Load settings from storage
    let settings = { ...DEFAULT_SETTINGS };
    try {
      const stored = await AsyncStorage.getItem("callSettings");
      if (stored) settings = { ...settings, ...JSON.parse(stored) };
    } catch (err) {
      console.warn("No stored call settings found. Using defaults.", err);
    }

    // Basic validation (to avoid 400s)
    if (!settings.modelProvider || !settings.modelName) {
      // console.error("Missing model configuration:", settings);
      setCallStatus(CALL_STATUS.INACTIVE);
      isStartingRef.current = false;
      return;
    }
    if (!settings.voiceProvider || !settings.voiceId) {
      console.error("Missing voice configuration:", settings);
      setCallStatus(CALL_STATUS.INACTIVE);
      isStartingRef.current = false;
      return;
    }
    if (!settings.systemPrompt?.trim()) {
      console.error("System prompt is empty.");
      setCallStatus(CALL_STATUS.INACTIVE);
      isStartingRef.current = false;
      return;
    }

    // Fill both system prompt and (optional) first message
    const systemContent = fillPrompt(settings.systemPrompt, opts?.caseContext);
    const rawFirst = (
      opts?.firstMessageOverride ||
      settings.firstMessage ||
      ""
    ).trim();
    const firstMessage = rawFirst
      ? fillPrompt(rawFirst, opts?.caseContext)
      : undefined;

    // Optional: debug once to ensure fields are injected
    // console.log("full prompts", systemContent);
    try {
      // console.log("Starting Vapi with:", {
      //   model: { provider: settings.modelProvider, model: settings.modelName },
      //   voice: { provider: settings.voiceProvider, voiceId: settings.voiceId },
      //   hasKey: !!process.env.EXPO_PUBLIC_VAPI_KEY,
      // });

      await vapi.start({
        model: {
          provider: settings.modelProvider, // "openai" | "anthropic"
          model: settings.modelName, // e.g., "gpt-4o"
          messages: [{ role: "system", content: systemContent }],
        },
        voice: {
          provider: settings.voiceProvider, // e.g., "11labs"
          voiceId: settings.voiceId, // e.g., "pNInz6obpgDQGcFmaJgB"
        },
        firstMessage, // now includes patient values if provided
      });
      // console.log("messages of this call", messages);
    } catch (error) {
      console.error("Failed to start call:", error);
      setCallStatus(CALL_STATUS.INACTIVE);
    } finally {
      isStartingRef.current = false;
    }
  };

  const stop = () => {
    setCallStatus(CALL_STATUS.FINISHED);
    vapi.stop();
  };

  const setMuted = (value: boolean) => {
    vapi.setMuted(value);
  };
  const isMuted = vapi.isMuted;

  const send = async (msg: any) => {
    const message: Message = {
      role: MessageRoleEnum.USER,
      transcript: msg,
      transcriptType: TranscriptMessageTypeEnum.FINAL,
      type: MessageTypeEnum.TRANSCRIPT,
    };

    const vapiMsg = await vapi.send({
      type: "add-message",
      message: { role: "user", content: msg },
    });

    setMessages((prev) => [...prev, message]);
    return vapiMsg;
  };

  const clearMessages = () => setMessages([]);

  return {
    callStatus,
    messages,
    startCall, // accepts { caseContext, firstMessageOverride }
    stop,
    setMuted,
    isMuted,
    send,
    isSpeaking,
    clearMessages,
    lastError,
    finalSummary,
    // new method to request final summary and stop
  };
}
