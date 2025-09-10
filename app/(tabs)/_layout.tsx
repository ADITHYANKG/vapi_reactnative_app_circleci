//C:\vapi-npm-15-Home-page-content-added-from-adithyan\app\(tabs)\_layout.tsx

import CustomTabBar from "@/components/navigation/CustomTabBar";
import { StyledTabs } from "@/components/navigation/tabs";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import TopBar from "@/components/TopBar";

const Layout = () => {
  const router = useRouter();
  return (
    <>
      <TopBar />
      <StyledTabs tabBar={(props) => <CustomTabBar {...props} />}>
        <Tabs.Screen
          name="(index)"
          options={{
            headerShown: false,
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            headerShown: false,
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="speedometer-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            headerShown: false,
            title: "Vapi",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="mic-outline" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="you"
          options={{
            headerShown: false,
            title: "You",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person-circle-outline"
                color={color}
                size={size}
              />
            ),
          }}
        />
      </StyledTabs>
    </>
  );
};

export default Layout;
