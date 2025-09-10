before that i will ,give the three file srelated to this scenario.
import React, { useState, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  StyleSheet,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useVapi, CALL_STATUS } from "@/hooks/useVapi";
import { MessageTypeEnum } from "@/utils/conversation.types";

type AssistantModalProps = {
  visible: boolean;
  onClose: () => void;
  caseContext?: {
    patient_name?: string;
    patientName?: string;
    patient_age?: number | string;
    age?: number | string;
    patient_sex?: string;
    sex?: string;
    case_summary?: string;
    summary?: string;
    [key: string]: any;
  };
};

export default function AssistantModal({
  visible,
  onClose,
  caseContext,
}: AssistantModalProps) {
  const {
    startCall,
    stop,
    callStatus,
    messages,
    isSpeaking,
    clearMessages,
    lastError,
    finalSummary,
  } = useVapi();

  const [callerName, setCallerName] = useState<string>("Doctor");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Caller (doctor) name from AsyncStorage -> demoUser
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("demoUser");
        const u = raw ? JSON.parse(raw) : null;
        const name =
          u?.firstName && u?.lastName
            ? `${u.firstName} ${u.lastName}`
            : u?.name || "Doctor";
        setCallerName(name);
      } catch {
        setCallerName("Doctor");
      }
    })();
  }, []);

  // Orb animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration: 1100,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Start/Stop call when modal opens/closes; wait for caseContext before starting
  useEffect(() => {
    // If the modal is closed, stop and exit.
    if (!visible) {
      stop();
      return;
    }

    // Modal open but no data yet — just wait (do NOT stop here).
    if (!caseContext) {
      console.log("break");
      return;
    }
    console.log("caseContext on  modal:", caseContext);
    const normalizedCtx = {
      patientName: caseContext.patientName,
      age: caseContext.age,
      sex: caseContext.sex,
      summary: caseContext.summary ?? caseContext.summary ?? "",
      callerName,
    };
    console.log("normalizedCtx:", normalizedCtx);
    console.log("call started");

    clearMessages();
    startCall({ caseContext: normalizedCtx });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    visible,
    caseContext?.patient_name,
    caseContext?.patient_age,
    caseContext?.patient_sex,
    caseContext?.case_summary,
    caseContext?.summary,
    callerName,
  ]);

  const handleClose = () => {
    console.log("final summary", finalSummary);
    if (
      callStatus === CALL_STATUS.ACTIVE ||
      callStatus === CALL_STATUS.CONNECTING
    ) {
      stop();
    }
    {
      onClose();
    }
  };

  let statusText = "";
  if (callStatus === CALL_STATUS.CONNECTING)
    statusText = "Connecting to AI Agent...";
  else if (callStatus === CALL_STATUS.ACTIVE)
    statusText = isSpeaking ? "Assistant is Speaking..." : "Connected";
  else if (callStatus === CALL_STATUS.FINISHED) statusText = "Call Ended";

  // Auto-scroll transcript to bottom
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Patient Assessment Assistant</Text>
          <Text
            style={{
              color: "#b3b3cc",
              textAlign: "center",
              marginBottom: 8,
              fontSize: 15,
            }}
          >
            Discuss the case history with the AI assistant below to help
            determine the patient's disease.
          </Text>

          <View style={styles.modalBody}>
            <View style={{ alignItems: "center", marginVertical: 10 }}>
              <Animated.View
                style={[
                  styles.orbShadow,
                  {
                    transform: [{ scale: pulseAnim }],
                    shadowOpacity: 0.38,
                    shadowRadius: 38,
                  },
                ]}
              >
                <LinearGradient
                  colors={["#9f7fff", "#6196e8", "#f395e8"]}
                  start={{ x: 0.1, y: 0.1 }}
                  end={{ x: 0.9, y: 0.9 }}
                  style={styles.orb}
                />
              </Animated.View>
            </View>

            <Text style={[styles.modalStatus, { marginTop: 8 }]}>
              {statusText}
            </Text>

            {lastError ? (
              <View
                style={{
                  backgroundColor: "#fee2e2",
                  borderColor: "#fecaca",
                  borderWidth: 1,
                  padding: 8,
                  borderRadius: 8,
                  marginTop: 8,
                  width: "100%",
                }}
              >
                <Text style={{ color: "#991b1b" }}>
                  Call error: {lastError}
                </Text>
              </View>
            ) : null}

            {/* Transcript */}
            <ScrollView
              ref={scrollViewRef}
              style={{
                width: "100%",
                marginTop: 12,
                backgroundColor: "#232345",
                borderRadius: 12,
                padding: 10,
                maxHeight: 220,
              }}
            >
              {messages
                .filter((m) => m.type === MessageTypeEnum.TRANSCRIPT)
                .map((message, idx) => (
                  <View
                    key={idx}
                    style={{
                      marginBottom: 10,
                      alignItems:
                        message.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <View
                      style={{
                        maxWidth: "80%",
                        borderRadius: 12,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        backgroundColor:
                          message.role === "user" ? "#fdba74" : "#e5e7eb",
                      }}
                    >
                      <Text style={{ fontSize: 14, color: "#1f2937" }}>
                        {message.transcript}
                      </Text>
                    </View>
                  </View>
                ))}
            </ScrollView>

            {callStatus === CALL_STATUS.FINISHED && finalSummary && (
              <View
                style={{
                  marginTop: 12,
                  padding: 10,
                  backgroundColor: "#eef2ff",
                  borderRadius: 8,
                  width: "100%",
                }}
              >
                <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                  Final Case Summary
                </Text>
                <Text>{finalSummary}</Text>
              </View>
            )}
          </View>

          <View style={styles.modalButtons}>
            {(callStatus === CALL_STATUS.CONNECTING ||
              callStatus === CALL_STATUS.ACTIVE) && (
              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.button,
                  { backgroundColor: "#f66", minWidth: 130 },
                ]}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  End Call
                </Text>
              </TouchableOpacity>
            )}
            {callStatus === CALL_STATUS.FINISHED && (
              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.button,
                  { backgroundColor: "#6196e8", minWidth: 130 },
                ]}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  Close
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "90%",
    backgroundColor: "#232333",
    borderRadius: 22,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 10,
    maxWidth: 430,
    minWidth: 290,
    minHeight: 360,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 22,
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  modalBody: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  modalStatus: {
    fontSize: 17,
    fontWeight: "600",
    color: "#6196e8",
    marginTop: 24,
    textAlign: "center",
    marginBottom: 2,
  },
  modalButtons: {
    width: "100%",
    alignItems: "center",
    marginBottom: 6,
  },
  button: {
    backgroundColor: "#6196e8",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 6,
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  orbShadow: {
    shadowColor: "#9e86ec",
    shadowOpacity: 0.32,
    shadowRadius: 38,
    shadowOffset: { width: 0, height: 50 },
    backgroundColor: "rgba(241,236,255,0.80)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 60,
    width: 120,
    height: 120,
    elevation: 20,
    borderWidth: 1,
    borderColor: "rgba(170,142,255,0.18)",
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.27)",
    overflow: "hidden",
  },
  dot: {
    width: 7,
    height: 25,
    backgroundColor: "#6196e8",
    marginHorizontal: 5,
    opacity: 0.8,
    marginTop: 2,
  },
});

import {
  Message,
  MessageRoleEnum,
  MessageTypeEnum,
  TranscriptMessageTypeEnum,
} from "@/utils/conversation.types";
import Vapi from "@vapi-ai/react-native";
import { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  console.log("ctx:", ctx);
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

  useEffect(() => {
    const onCallStartHandler = () => setCallStatus(CALL_STATUS.ACTIVE);
    const onCallEnd = () => setCallStatus(CALL_STATUS.FINISHED);

    const onMessageUpdate = (message: Message) => {
      if (
        message.type === MessageTypeEnum.TRANSCRIPT &&
        message.transcriptType === TranscriptMessageTypeEnum.FINAL
      ) {
        setMessages((prev) => [...prev, message]);
        if (
          message.role === "assistant" &&
          message.transcript.trim().toLowerCase().startsWith("final summary:")
        ) {
          setFinalSummary(message.transcript.trim());
        }
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
    setFinalSummary(null);
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
      console.error("Missing model configuration:", settings);
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
    console.log("full prompts", systemContent);
    try {
      console.log("Starting Vapi with:", {
        model: { provider: settings.modelProvider, model: settings.modelName },
        voice: { provider: settings.voiceProvider, voiceId: settings.voiceId },
        hasKey: !!process.env.EXPO_PUBLIC_VAPI_KEY,
      });

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
  };
}

// app/(tabs)/dashboard.tsx
import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { patients } from "@/components/patientdata";
import PatientCard from "@/components/PatientCard";
import AssistantModal from "@/components/AssistantModal";

type Patient = (typeof patients)[number];

type CaseContext = {
  patientName?: string;
  age?: number | string;
  sex?: string;
  summary?: string;
};

export default function Dashboard() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseContext | undefined>(
    undefined
  );
  const [sortType, setSortType] = useState("name-asc");

  const getSortedPatients = () => {
    let sorted = [...patients];
    switch (sortType) {
      case "name-asc":
        sorted.sort((a, b) => a.patient_name.localeCompare(b.patient_name));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.patient_name.localeCompare(a.patient_name));
        break;
      case "age-asc":
        sorted.sort((a, b) => a.patient_age - b.patient_age);
        break;
      case "age-desc":
        sorted.sort((a, b) => b.patient_age - a.patient_age);
        break;
      case "gender-asc":
        sorted.sort((a, b) =>
          (a.patient_sex || "").localeCompare(b.patient_sex || "")
        );
        break;
      case "gender-desc":
        sorted.sort((a, b) =>
          (b.patient_sex || "").localeCompare(a.patient_sex || "")
        );
        break;
      case "date-asc":
        sorted.sort(
          (a, b) =>
            new Date(a.date_created).getTime() -
            new Date(b.date_created).getTime()
        );
        break;
      case "date-desc":
        sorted.sort(
          (a, b) =>
            new Date(b.date_created).getTime() -
            new Date(a.date_created).getTime()
        );
        break;
      default:
        break;
    }
    return sorted;
  };

  const sortOptions = [
    { label: "Name (A-Z)", value: "name-asc" },
    { label: "Name (Z-A)", value: "name-desc" },
    { label: "Age (Ascending)", value: "age-asc" },
    { label: "Age (Descending)", value: "age-desc" },
    { label: "Gender (A-Z)", value: "gender-asc" },
    { label: "Gender (Z-A)", value: "gender-desc" },
    { label: "Date Created (Oldest)", value: "date-asc" },
    { label: "Date Created (Newest)", value: "date-desc" },
  ];

  const [dropdownVisible, setDropdownVisible] = useState(false);

  return (
    <>
      <View style={{ zIndex: 200 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 16,
            backgroundColor: "#f3f4f6",
            justifyContent: "space-between",
            zIndex: 200,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 18 }}>Patients</Text>
          <View style={{ position: "relative", zIndex: 201 }}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setDropdownVisible((v) => !v)}
              activeOpacity={0.8}
            >
              <Ionicons name="funnel-outline" size={28} color="#333" />
            </TouchableOpacity>
            {dropdownVisible && (
              <>
                <Pressable
                  style={styles.dropdownOverlay}
                  onPress={() => setDropdownVisible(false)}
                />
                <View style={styles.dropdownMenu}>
                  {sortOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownItem,
                        sortType === option.value && styles.dropdownItemActive,
                      ]}
                      onPress={() => {
                        setSortType(option.value);
                        setDropdownVisible(false);
                      }}
                    >
                      <Text
                        style={{
                          color: sortType === option.value ? "#6196e8" : "#222",
                          fontWeight:
                            sortType === option.value ? "bold" : "normal",
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: "#f3f4f6" }}
        contentContainerStyle={{ padding: 16 }}
      >
        {getSortedPatients().map((p, idx) => (
          <PatientCard
            key={p.patient_name + idx}
            patient={p}
            onPress={() => {
              console.log("patients", p);
              // Build a normalized case context from your patient record
              setSelectedCase({
                patientName: p.patient_name,
                age: p.patient_age,
                sex: p.patient_sex,
                summary:
                  (p.case_history as string) ??
                  (p.case_history as string) ??
                  "",
              });
              setModalVisible(true);
            }}
          />
        ))}
      </ScrollView>

      <AssistantModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        // 🔽 pass the normalized context
        caseContext={selectedCase}
      />
    </>
  );
}

const styles = StyleSheet.create({
  dropdownButton: {
    backgroundColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 201,
  },
  dropdownMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 10,
    zIndex: 202,
    minWidth: 180,
    paddingVertical: 4,
  },
  dropdownOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  dropdownItemActive: {
    backgroundColor: "#f3f4f6",
  },
});

.These are my assistant modal,usevapi ,and dashboard files .(may not be in this order).here i am trying to implement the final summary after the call is ended . ( what changes i need to do here).before step by step solution explain the flow of the variable visible is depends on Modal open and close .provide the flow.