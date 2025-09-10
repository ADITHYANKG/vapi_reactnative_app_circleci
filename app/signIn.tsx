// C:\vapi-npm-15-Home-page-content-added-from-adithyan\app\signIn.tsx
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { z } from "zod";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

const signInSchema = z.object({
  email: z.string().min(3, "Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});
type SignInForm = z.infer<typeof signInSchema>;

// Hardcoded demo user
const DEMO_USER = {
  email: "john@vite.net",
  password: "12345678",
  name: "John Vite",
};

const SignInScreen = () => {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const onSubmit = async (data: SignInForm) => {
    // Check credentials against hardcoded user
    if (
      data.email.trim().toLowerCase() === DEMO_USER.email &&
      data.password === DEMO_USER.password
    ) {
      // Set signed-in status in AsyncStorage
      await AsyncStorage.setItem("isSignedIn", "true");
      // Optionally, you can store user info:
      await AsyncStorage.setItem("demoUser", JSON.stringify(DEMO_USER));
      // router.replace("");
    } else {
      Alert.alert("Invalid credentials", "Incorrect email or password.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.background} />
      <View style={styles.innerContainer}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />
        <TouchableOpacity
          style={styles.backArrow}
          onPress={() => router.replace("/welcome")}
        >
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.welcome}>Welcome back!</Text>
        <Text style={styles.desc}>We're so excited to see you again!</Text>
        <View style={{ height: 32 }} />
        {/* Email */}
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[
                styles.input,
                errors.email ? { borderColor: "#F04747" } : {},
              ]}
              placeholder="Email"
              placeholderTextColor="#b9bbbe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}
        {/* Password */}
        <View style={{ marginTop: 12 }}>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.password ? { borderColor: "#F04747" } : {},
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#b9bbbe"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  secureTextEntry={!showPassword}
                  textContentType="password"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Ionicons
                    name={showPassword ? "eye" : "eye-off"}
                    size={24}
                    color="#b9bbbe"
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
        <TouchableOpacity
          onPress={() => {
            /* no-op for forgot password in demo */
          }}
          style={{ marginTop: 8 }}
        >
          <Text style={styles.forgot}>Forgot your password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.loginBtnText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#23272A" },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#23272A",
  },
  innerContainer: {
    flex: 1,
    paddingTop: 60,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backArrow: {
    position: "absolute",
    top: 60,
    left: 18,
    zIndex: 10,
  },
  welcome: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
    textAlign: "center",
  },
  desc: {
    color: "#b9bbbe",
    fontSize: 16,
    marginTop: 6,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  input: {
    width: width - 60,
    backgroundColor: "#2f3136",
    color: "white",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    borderColor: "#202225",
    borderWidth: 1,
    marginBottom: 2,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    top: 12,
  },
  forgot: {
    color: "#00B0F4",
    fontSize: 15,
    marginBottom: 2,
  },
  loginBtn: {
    backgroundColor: "#5865F2",
    borderRadius: 24,
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 28,
  },
  loginBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 19,
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#F04747",
    alignSelf: "flex-start",
    marginLeft: 2,
    marginBottom: 2,
    fontWeight: "600",
  },
});

export default SignInScreen;
