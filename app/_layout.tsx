import { StyledStack } from "@/components/navigation/stack";
import "@/global.css";
import { storage } from "@/utils/storage";
import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { cssInterop } from "nativewind";
import { useCallback, useEffect, useState } from "react";
import {
  LogBox,
  Platform,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSyncQueriesExternal } from "react-query-external-sync";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Sentry setup
Sentry.init({
  dsn: "https://099e523017b1f9bba6d8028c1e0a675d@o106619.ingest.us.sentry.io/4509484575424512",
  sendDefaultPii: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration()],
});

const queryClient = new QueryClient();

LogBox.ignoreLogs(["[ios] Socket connection error: websocket error"]);

cssInterop(Ionicons, {
  className: {
    target: false,
    nativeStyleToProp: {
      color: true,
    },
  },
});

// Improved AuthGuard with better logout handling
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const segments = useSegments();
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      // console.log("Checking auth status...");
      const signInStatus = await AsyncStorage.getItem("isSignedIn");
      const userSignedIn = signInStatus === "true";

      // console.log("Auth status:", userSignedIn, "Current segments:", segments);

      setIsSignedIn(userSignedIn);
      setIsLoading(false);

      return userSignedIn;
    } catch (error) {
      // console.error("Error checking auth status:", error);
      setIsSignedIn(false);
      setIsLoading(false);
      return false;
    }
  }, [segments]);

  // Listen for AsyncStorage changes (for logout detection)
  useEffect(() => {
    // Initial check
    checkAuthStatus();

    // Set up periodic check to catch logout events
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 1000);

    return () => clearInterval(interval);
  }, [checkAuthStatus]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) {
      console.log("Still loading auth state...");
      return;
    }

    const currentSegment = segments[0];
    const publicPages = ["welcome", "signIn", "signUp"];
    const isOnPublicPage = publicPages.includes(currentSegment);

    // console.log("Navigation check:", {
    //   isSignedIn,
    //   currentSegment,
    //   isOnPublicPage,
    //   segments,
    // });

    // If NOT signed in and NOT on a public page, redirect to welcome
    if (!isSignedIn && !isOnPublicPage) {
      console.log("Redirecting to welcome (not signed in)");
      router.replace("/welcome");
      return;
    }

    // If signed in and on a public page, redirect to main app
    if (isSignedIn && isOnPublicPage) {
      console.log("Redirecting to main app (signed in)");
      router.replace("/(tabs)");
      return;
    }
  }, [isLoading, isSignedIn, segments, router]);

  // Show nothing while loading or while redirecting
  if (isLoading) {
    console.log("Loading auth guard...");
    return null;
  }

  // Don't render the protected content if not signed in and not on public pages
  if (
    !isSignedIn &&
    segments.length > 0 &&
    !["welcome", "signIn", "signUp"].includes(segments[0])
  ) {
    console.log("Blocking access to protected route");
    return null;
  }

  return <>{children}</>;
};

const InitialLayout = () => {
  const router = useRouter();

  useEffect(() => {
    Sentry.setUser(null);
  }, []);

  return (
    <StyledStack
      contentClassName="bg-gray-100 dark:bg-background"
      headerClassName="bg-dark text-white"
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="signIn"
        options={{
          presentation: "fullScreenModal",
          title: "Amazon",
        }}
      />
      <Stack.Screen
        name="signUp"
        options={{
          presentation: "fullScreenModal",
          title: "Register",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
        }}
      />
      {/* <Stack.Screen
        name="(modal)/rufus"
        options={{
          title: 'Rufus',
          headerTintColor: '#000',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.dismiss()}>
              <Ionicons name="close" size={24} className="text-gray-400" />
            </TouchableOpacity>
          ),
          presentation: 'formSheet',
          sheetAllowedDetents: [0.45, 0.95],
          sheetInitialDetentIndex: 0,
          sheetGrabberVisible: true,
          contentStyle: {
            backgroundColor: '#fff',
          },
        }}
      /> */}
    </StyledStack>
  );
};

const RootLayout = () => {
  const colorScheme = useColorScheme();

  useSyncQueriesExternal({
    queryClient,
    socketURL: "http://localhost:42831",
    deviceName: Platform?.OS || "web",
    platform: Platform?.OS || "web",
    deviceId: Platform?.OS || "web",
    extraDeviceInfo: {
      appVersion: "1.0.0",
    },
    enableLogs: false,
    envVariables: {
      NODE_ENV: process.env.NODE_ENV,
    },
    mmkvStorage: storage,
    
  });

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider
          value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
          <AuthGuard>
            <InitialLayout />
          </AuthGuard>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
};

export default Sentry.wrap(RootLayout);
