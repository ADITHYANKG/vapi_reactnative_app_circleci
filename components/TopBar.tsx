//C:\vapi-npm-15-Home-page-content-added-from-adithyan\components\TopBar.tsx
import React from "react";
import { View, Text, Image, StatusBar } from "react-native";
import UserDropdown from "./UserDropdown";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TopBar() {
  return (
    <SafeAreaView
      style={{
        width: "100%",
        height: 110,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#f0f0f0",
        paddingHorizontal: 10,
        justifyContent: "space-between",
        elevation: 20,
        zIndex: 100,
      }}
    >
      {/* Logo & App Name */}
      <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
        <Image
          source={require("@/assets/images/rufus.png")}
          style={{ width: 80, height: 60, borderRadius: 12, marginRight: 12 }}
          resizeMode="contain"
        />
        <Text
          style={{
            fontSize: 21,
            fontWeight: "800",
            color: "#151D26",
            letterSpacing: 1.2,
          }}
        >
          ClareMD
        </Text>
      </View>
      {/* User Dropdown */}

      <UserDropdown />
    </SafeAreaView>
  );
}
