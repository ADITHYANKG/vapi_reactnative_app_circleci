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
  const [showSummary, setShowSummary] = useState(false);
  console.log("state for modal visible:", showSummary);
  // console.log("final summary in the modal ==============", finalSummary);
  const [callerName, setCallerName] = useState<string>("Doctor");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const firedRef = useRef(false);
  useEffect(() => {
    if (
      !firedRef.current &&
      callStatus === CALL_STATUS.FINISHED &&
      finalSummary
    ) {
      // Close the call modal…
      firedRef.current = true;
      onClose?.();
      // …then show the summary modal
      setShowSummary(true);
    }
  }, [callStatus, finalSummary, onClose]);

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
    // console.log("caseContext on  modal:", caseContext);
    const normalizedCtx = {
      patientName: caseContext.patientName,
      age: caseContext.age,
      sex: caseContext.sex,
      summary: caseContext.summary ?? caseContext.summary ?? "",
      callerName,
    };
    // console.log("normalizedCtx:", normalizedCtx);
    // console.log("call started");

    clearMessages();
    startCall({ caseContext: normalizedCtx });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, caseContext, callerName]);
  // console.log("callStatus in modal", callStatus);
  const handleClose = () => {
    // console.log("final summary on Modal ", finalSummary);
    if (
      callStatus === CALL_STATUS.ACTIVE ||
      callStatus === CALL_STATUS.CONNECTING
    ) {
      stop();
    }

    onClose();
    if (finalSummary) {
      setShowSummary(true);
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
  // console.log("messages in modal", messages);
  return (
    <>
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
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
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
      {/* Summary Modal */}
      <Modal
        visible={showSummary}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSummary(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: "#0f1224" }]}>
            <Text style={[styles.modalTitle, { marginBottom: 4 }]}>
              Final Case Summary
            </Text>
            <Text
              style={{
                color: "#9aa0b4",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Review and copy the summary generated from the call.
            </Text>

            <View style={[styles.modalBody, { alignItems: "stretch" }]}>
              <ScrollView
                style={{
                  flex: 1,
                  backgroundColor: "#1a1f36",
                  borderRadius: 12,
                  padding: 12,
                  maxHeight: 420,
                }}
              >
                <Text style={{ color: "#e5e7eb", lineHeight: 22 }}>
                  {finalSummary || "No summary available."}
                </Text>
              </ScrollView>
            </View>

            <View
              style={[styles.modalButtons, { flexDirection: "row", gap: 10 }]}
            >
              {/* <TouchableOpacity
                onPress={async () => {
                  const text = finalSummary || "";
                  const { setStringAsync } = await import("expo-clipboard");
                  await setStringAsync(text);
                }}
                style={[
                  styles.button,
                  { backgroundColor: "#334155", minWidth: 120 },
                ]}
              >
                <Text style={styles.buttonText}>Copy</Text>
              </TouchableOpacity> */}

              <TouchableOpacity
                onPress={() => setShowSummary(false)}
                style={[
                  styles.button,
                  { backgroundColor: "#6196e8", minWidth: 120 },
                ]}
              >
                <Text style={[styles.buttonText, { color: "#fff" }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
