import React, { useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  StyleSheet,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "@/utils/storage";

export default function UserDropdown() {
  const [modalVisible, setModalVisible] = useState(false);

  const [user, setUser] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  }>({});
  const router = useRouter();

  // Load user info from AsyncStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("demoUser");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setUser({});
      }
    };

    if (modalVisible) {
      loadUser();
    }
  }, [modalVisible]);

  // Log out: clear all session data and force navigation
  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      setModalVisible(false);

      // Clear all session data
      await AsyncStorage.multiRemove(["isSignedIn", "demoUser"]);

      // Also clear using storage utility if it exists
      try {
        await storage.delete("isSignedIn");
        await storage.delete("demoUser");
      } catch (storageError) {
        console.log("Storage utility error (might not exist):", storageError);
      }

      // Force immediate navigation to welcome screen
      // Using setTimeout to ensure state is cleared first
      setTimeout(() => {
        router.replace("/welcome");
      }, 100);
    } catch (error) {
      console.error("Logout error:", error);
      // Force navigation even if there's an error
      router.replace("/welcome");
    }
  };

  // Fallback avatar for demo
  const avatar =
    user.avatar ||
    "https://ui-avatars.com/api/?name=" +
      encodeURIComponent(
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : "User"
      ) +
      "&background=0D8ABC&color=fff";

  return (
    <View>
      {/* Avatar Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        style={{ marginLeft: 8 }}
      >
        <Image
          source={{ uri: avatar }}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#e5e7eb",
          }}
        />
      </TouchableOpacity>

      {/* Dropdown Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <Image source={{ uri: avatar }} style={styles.dropdownAvatar} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.dropdownName} numberOfLines={1}>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : "User"}
                </Text>
                <Text style={styles.dropdownEmail} numberOfLines={1}>
                  {user.email || ""}
                </Text>
              </View>
            </View>
            <View style={styles.separator} />

            {/* Settings - not implemented */}
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                router.push("/(tabs)/you");
                setModalVisible(false);
              }}
            >
              <Ionicons name="settings-outline" size={22} color="#888" />
              <Text style={styles.dropdownItemTextDisabled}>Settings</Text>
            </TouchableOpacity>

            {/* Logout */}
            {/* <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color="#e11d48" />
              <Text style={[styles.dropdownItemText, { color: '#e11d48', fontWeight: '700' }]}>
                Log Out
              </Text>
            </TouchableOpacity> */}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(80,80,80,0.16)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 70,
    paddingRight: 16,
  },
  dropdown: {
    width: 235,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  dropdownAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#e5e7eb",
  },
  dropdownName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#23272A",
    marginBottom: 1,
  },
  dropdownEmail: {
    color: "#666",
    fontSize: 13,
    fontWeight: "500",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 2,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  dropdownItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#222",
    fontWeight: "600",
  },
  dropdownItemTextDisabled: {
    fontSize: 16,
    marginLeft: 12,
    color: "#0b0b0bff",
    fontWeight: "500",
  },
});
