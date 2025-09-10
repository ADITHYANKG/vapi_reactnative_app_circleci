// app/(tabs)/you.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter } from "expo-router";

type DemoUser = {
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string;
  memberSince?: string; // ISO string
};

export default function YouScreen() {
  const router = useRouter();

  const [user, setUser] = useState<DemoUser | null>(null);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("demoUser");
        const parsed = raw ? JSON.parse(raw) : {};
        setUser({
          ...parsed,
          username: parsed?.username ?? "you",
          email: parsed?.email ?? "you@example.com",
          memberSince: parsed?.memberSince ?? new Date().toISOString(),
        });
      } catch {
        setUser({
          name: "User",
          username: "you",
          email: "you@example.com",
          memberSince: new Date().toISOString(),
        });
      }
    })();
  }, []);

  const displayName = useMemo(() => {
    if (!user) return "";
    if (user.firstName || user.lastName)
      return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    return user.name || user.username || "User";
  }, [user]);

  const avatarUri =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      displayName || "U"
    )}&background=0D8ABC&color=fff`;

  const memberSince = useMemo(() => {
    if (!user?.memberSince) return "";
    try {
      const d = new Date(user.memberSince);
      return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return user.memberSince;
    }
  }, [user?.memberSince]);

  const onPressLogout = async () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.setItem("isSignedIn", "false");
            // (Optional) clear any session data you store:
            // await AsyncStorage.removeItem("demoUser");
          } finally {
            router.replace("/welcome");
          }
        },
      },
    ]);
  };

  const onPressEdit = () => {
    // Wire this up later to your edit profile modal/page
    Alert.alert("Edit Profile", "Coming soon.");
  };

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header card */}
        <View style={styles.headerCard}>
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.subText}>@{user?.username}</Text>
            <Text style={[styles.subText, { marginTop: 2 }]}>
              Member since {memberSince}
            </Text>
          </View>
          <TouchableOpacity onPress={onPressEdit} style={styles.editBtn}>
            <Ionicons name="create-outline" size={18} color="#2563eb" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Account */}
        <Section title="Account">
          <Row
            icon="mail-outline"
            label="Email"
            value={user?.email || "you@example.com"}
          />
          <Row
            icon="person-outline"
            label="Username"
            value={`@${user?.username}`}
          />
        </Section>

        {/* Preferences (dummy for now) */}
        <Section title="Preferences">
          <RowSwitch
            icon="notifications-outline"
            label="Notifications"
            value={notifEnabled}
            onValueChange={setNotifEnabled}
          />
          <Row
            icon="language-outline"
            label="Language"
            value="English (US)"
            onPress={() => Alert.alert("Language", "Coming soon.")}
            chevron
          />
          <Row
            icon="color-palette-outline"
            label="Appearance"
            value="Light"
            onPress={() => Alert.alert("Appearance", "Coming soon.")}
            chevron
          />
        </Section>

        {/* Privacy & Security (dummy) */}
        <Section title="Privacy & Security">
          <RowSwitch
            icon="analytics-outline"
            label="Product Analytics"
            value={analyticsEnabled}
            onValueChange={setAnalyticsEnabled}
          />
          <Row
            icon="shield-checkmark-outline"
            label="Two-factor Authentication"
            value="Off"
            onPress={() => Alert.alert("Two-factor", "Coming soon.")}
            chevron
          />
          <Row
            icon="ban-outline"
            label="Blocked Users"
            value=""
            onPress={() => Alert.alert("Blocked Users", "Coming soon.")}
            chevron
          />
        </Section>

        {/* About (dummy) */}
        <Section title="About">
          <Row
            icon="information-circle-outline"
            label="Version"
            value="1.0.0"
          />
          <Row
            icon="document-text-outline"
            label="Terms & Policies"
            value=""
            onPress={() => Alert.alert("Policies", "Coming soon.")}
            chevron
          />
        </Section>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onPressLogout}>
          <Ionicons name="log-out-outline" size={18} color="#030303ff" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

/* Small UI helpers */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  chevron,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  chevron?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.row}
    >
      <Ionicons name={icon} size={20} color="#64748b" />
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      {!!value && <Text style={styles.rowValue}>{value}</Text>}
      {chevron && <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />}
    </TouchableOpacity>
  );
}

function RowSwitch({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color="#64748b" />
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

/* Light theme, clean, “native” look */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f7f7fb",
  },
  headerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    margin: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ebeef5",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  subText: {
    color: "#6b7280",
    marginTop: 2,
  },
  editBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#c7d2fe",
    backgroundColor: "#eef2ff",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  editBtnText: {
    color: "#2563eb",
    fontWeight: "700",
  },
  section: { marginHorizontal: 16, marginTop: 6 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#ebeef5",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 12,
  },
  rowLabel: { color: "#111827", fontSize: 15, fontWeight: "500" },
  rowValue: { color: "#6b7280", fontSize: 14 },
  logoutBtn: {
    marginTop: 18,
    marginHorizontal: 16,
    backgroundColor: "#b3b3b36e",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#212020ff", fontSize: 16, fontWeight: "700" },
});
