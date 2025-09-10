// app/(tabs)/profile.tsx (Settings screen)
import React, { useEffect, useMemo, useState } from "react";
import { Stack } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

type CallSettings = {
  systemPrompt: string;
  modelProvider: "openai" | "anthropic";

  modelName: string;
  voiceProvider: "11labs" | "lmnt" | "playht" | "openai" | "azure" | "rime-ai";
  voiceId: string;
  firstMessage: string;
};

const DEFAULTS: CallSettings = {
  systemPrompt: "You are a helpful AI assistant.",
  modelProvider: "openai",
  modelName: "gpt-4o",
  voiceProvider: "11labs",
  voiceId: "mark-11labs", // use canonical to avoid 400 errors
  firstMessage: "Hello! How can I help you today?",
};

// 🔎 Gender map for known voices (expand as needed)
const VOICE_GENDER: Record<string, "male" | "female" | "neutral"> = {
  // 11labs
  "mark-11labs": "male",
  "sarah-11labs": "female",
  "ryan-11labs": "male",

  // LMNT
  "amy-lmnt": "female",
  "daniel-lmnt": "male",
  "sophie-lmnt": "female",
  "miles-lmnt": "male",

  // PlayHT
  "will-playht": "male",
  "jennifer-playht": "female",
  "matt-playht": "male",

  // OpenAI (voices aren’t strictly gendered; this is an approximate UX hint)
  "alloy-openai": "male",
  "fable-openai": "male",
  "nova-openai": "female",
  "shimmer-openai": "female",
  "onyx-openai": "male",

  // Azure
  "andrew-azure": "male",
  "brian-azure": "male",
  "emma-azure": "female",

  // Rime AI
  "jen-rime-ai": "female",
  "ally-rime-ai": "female",
  "maria-rime-ai": "female",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<CallSettings>(DEFAULTS);
  const [saving, setSaving] = useState(false);
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("male");

  const modelOptions = useMemo(
    () => ({
      openai: ["gpt-4o", "gpt-5", "gpt-4o-mini", "gpt-4o-realtime-preview"], // keep your list; ensure you normalize in useVapi if needed
      anthropic: [
        "claude-sonnet-4-20250514",
        "claude-opus-4-20250514",
        "claude-3-7-sonnet-20250219",
        "claude-3-5-sonnet-20241022",
        "claude-3-5-haiku-20241022",
        "claude-3-opus-20240229",
        "claude-3-sonnet-20240229",
        "claude-3-haiku-20240307",
      ],
    }),
    []
  );

  const voiceOptions = useMemo(
    () => ({
      "11labs": ["mark-11labs", "sarah-11labs", "ryan-11labs"],
      lmnt: ["amy-lmnt", "daniel-lmnt", "sophie-lmnt", "miles-lmnt"],
      playht: ["will-playht", "jennifer-playht", "matt-playht"],
      openai: [
        "alloy-openai",
        "fable-openai",
        "nova-openai",
        "shimmer-openai",
        "onyx-openai",
      ],
      azure: ["andrew-azure", "brian-azure", "emma-azure"],
      "rime-ai": ["jen-rime-ai", "ally-rime-ai", "maria-rime-ai"],
    }),
    []
  );

  // Load settings
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("callSettings");
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULTS, ...parsed });
        }
      } catch {
        // ignore
      }
    })();
  }, []);

  const onSave = async () => {
    if (!settings.modelName)
      return Alert.alert("Validation", "Please choose a model.");
    if (!settings.voiceId)
      return Alert.alert("Validation", "Please provide a voice ID.");
    if (!settings.systemPrompt.trim())
      return Alert.alert("Validation", "System prompt cannot be empty.");

    try {
      setSaving(true);
      await AsyncStorage.setItem("callSettings", JSON.stringify(settings));
      Alert.alert("Saved", "Settings updated.");
    } catch {
      Alert.alert("Error", "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    setSettings(DEFAULTS);
    await AsyncStorage.setItem("callSettings", JSON.stringify(DEFAULTS));
    Alert.alert("Reset", "Settings restored to defaults.");
  };

  const modelsForProvider = modelOptions[settings.modelProvider] || [];

  // 🔎 Filter voices by provider + gender
  const filteredVoicesForProvider = useMemo(() => {
    const all = voiceOptions[settings.voiceProvider] || [];
    return all.filter((v) => VOICE_GENDER[v] === voiceGender);
  }, [voiceOptions, settings.voiceProvider, voiceGender]);

  // 🧹 Keep voiceId valid when provider/gender changes
  useEffect(() => {
    if (!filteredVoicesForProvider.includes(settings.voiceId)) {
      const first = filteredVoicesForProvider[0];
      if (first) {
        setSettings((p) => ({ ...p, voiceId: first }));
      } else {
        setSettings((p) => ({ ...p, voiceId: "" }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    settings.voiceProvider,
    voiceGender,
    filteredVoicesForProvider.join("|"),
  ]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false, title: "Settings" }} />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Section title="Model">
          <Field label="Provider">
            <Picker
              selectedValue={settings.modelProvider}
              onValueChange={(v) =>
                setSettings((p) => ({
                  ...p,
                  modelProvider: v,
                  modelName: modelOptions[v as keyof typeof modelOptions][0],
                }))
              }
              style={styles.picker}
            >
              <Picker.Item label="OpenAI" value="openai" />
              <Picker.Item label="Anthropic" value="anthropic" />
            </Picker>
          </Field>

          <Field label="Model Name">
            <Picker
              selectedValue={settings.modelName}
              onValueChange={(v) =>
                setSettings((p) => ({ ...p, modelName: v }))
              }
              style={styles.picker}
            >
              {modelsForProvider.map((m) => (
                <Picker.Item key={m} label={m} value={m} />
              ))}
            </Picker>
          </Field>
        </Section>

        <Section title="Voice">
          <Field label="Voice Provider">
            <Picker
              selectedValue={settings.voiceProvider}
              onValueChange={(v) =>
                setSettings((p) => ({
                  ...p,
                  voiceProvider: v,
                  // reset voiceId after provider change (will adjust again via useEffect)
                  voiceId: (voiceOptions as any)[v]?.[0] ?? "",
                }))
              }
              style={styles.picker}
            >
              <Picker.Item label="ElevenLabs" value="11labs" />
              <Picker.Item label="LMNT" value="lmnt" />
              <Picker.Item label="PlayHT" value="playht" />
              <Picker.Item label="OpenAI" value="openai" />
              <Picker.Item label="Azure" value="azure" />
              <Picker.Item label="Rime AI" value="rime-ai" />
            </Picker>
          </Field>

          {/* Gender Toggle */}
          <Field label="Gender">
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Chip
                label="Male"
                active={voiceGender === "male"}
                onPress={() => setVoiceGender("male")}
              />
              <Chip
                label="Female"
                active={voiceGender === "female"}
                onPress={() => setVoiceGender("female")}
              />
            </View>
          </Field>

          <Field label="Voice ID">
            <Picker
              selectedValue={settings.voiceId}
              onValueChange={(v) => setSettings((p) => ({ ...p, voiceId: v }))}
              style={styles.picker}
            >
              {filteredVoicesForProvider.map((v) => (
                <Picker.Item key={v} label={v} value={v} />
              ))}
            </Picker>

            <Text style={styles.help}>
              Only voices matching the selected gender are shown.
            </Text>
          </Field>
        </Section>

        <Section title="Prompt">
          <Field label="First Message (optional)">
            <TextInput
              value={settings.firstMessage}
              onChangeText={(v) =>
                setSettings((p) => ({ ...p, firstMessage: v }))
              }
              placeholder="What the assistant should say first"
              style={styles.input}
            />
          </Field>
          <Field label="System Prompt">
            <TextInput
              value={settings.systemPrompt}
              onChangeText={(v) =>
                setSettings((p) => ({ ...p, systemPrompt: v }))
              }
              placeholder="Enter the full system prompt"
              style={[styles.input, styles.multiline]}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </Field>
        </Section>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={onReset}
            style={[styles.button, styles.ghost]}
          >
            <Text style={[styles.buttonText, { color: "#5865F2" }]}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onSave}
            style={styles.button}
            disabled={saving}
          >
            <Text style={styles.buttonText}>
              {saving ? "Saving..." : "Save Settings"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------- UI helpers ---------- */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={ui.section}>
      <Text style={ui.sectionTitle}>{title}</Text>
      <View style={ui.card}>{children}</View>
    </View>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={ui.label}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: active ? "#5865F2" : "#d1d5db",
        },
      ]}
    >
      <Text style={{ color: active ? "#fff" : "#111" }}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 36 },
  picker: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
  },
  multiline: { minHeight: 120 },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#5865F2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  ghost: { backgroundColor: "#eef2ff", borderWidth: 1, borderColor: "#5865F2" },
  buttonText: { color: "#fff", fontWeight: "700" },
  help: { fontSize: 12, color: "#6b7280", marginTop: 6 },
});

const ui = StyleSheet.create({
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 10 },
  card: {
    backgroundColor: "#f7f7fb",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#ebeef5",
  },
  label: { fontSize: 13, color: "#374151", marginBottom: 6 },
});
