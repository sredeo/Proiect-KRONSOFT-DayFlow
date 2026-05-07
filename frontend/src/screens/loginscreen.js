import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function LoginScreen({ onGoToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    Alert.alert("Login", "Login button was pressed.");
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Login", "Continue with Google - mock action.");
  };

  const handleRegister = () => {
    if (onGoToRegister) {
      onGoToRegister();
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.smallHeader}>Login</Text>

          <View style={styles.topStrip} />

          <View style={styles.content}>
            <Text style={styles.title}>Log in</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#b8b8b8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#b8b8b8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Pressable style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Log in</Text>
              </Pressable>

              <Pressable onPress={handleRegister}>
                <Text style={styles.registerText}>
                  Don't have an account? Register!
                </Text>
              </Pressable>
            </View>

            <Pressable style={styles.googleButton} onPress={handleGoogleLogin}>
              <FontAwesome name="google" size={16} color="#ffffff" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>
          </View>

          <View style={styles.bottomStrip} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#ffffff",
  },
  smallHeader: {
    color: "#8a8a8a",
    fontSize: 12,
    marginLeft: 18,
    marginTop: 14,
    marginBottom: 8,
  },
  topStrip: {
    height: 47,
    width: "100%",
    backgroundColor: "#fde5e5",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 42,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 64,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 64,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 6,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
    marginBottom: 56,
  },
  label: {
    fontSize: 15,
    color: "#2b2b2b",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 6,
    paddingHorizontal: 20,
    fontSize: 14,
    color: "#222222",
    marginBottom: 20,
  },
  loginButton: {
    height: 38,
    borderRadius: 6,
    backgroundColor: "#2f2f2f",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
  registerText: {
    color: "#0000ee",
    fontSize: 15,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  googleButton: {
    height: 40,
    minWidth: 197,
    paddingHorizontal: 16,
    borderRadius: 2,
    backgroundColor: "#2f2f2f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  googleButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
  bottomStrip: {
    height: 30,
    width: "100%",
    backgroundColor: "#fde5e5",
  },
});
