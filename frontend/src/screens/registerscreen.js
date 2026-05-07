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

export default function RegisterScreen({ onGoToLogin }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    Alert.alert("Account Created", "Mock registration completed successfully.");
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
          <Text style={styles.smallHeader}>Register</Text>

          <View style={styles.topStrip} />

          <View style={styles.content}>
            <Text style={styles.title}>Register</Text>

            <View style={styles.card}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                placeholderTextColor="#b8b8b8"
                value={firstName}
                onChangeText={setFirstName}
              />

              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your last name"
                placeholderTextColor="#b8b8b8"
                value={lastName}
                onChangeText={setLastName}
              />

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

              <Pressable style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Create Account</Text>
              </Pressable>

              <Pressable onPress={onGoToLogin}>
                <Text style={styles.loginText}>Already have an account? Log in!</Text>
              </Pressable>
            </View>
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
    fontSize: 62,
    fontWeight: "800",
    color: "#202020",
    marginBottom: 56,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 22,
    backgroundColor: "#ffffff",
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
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#222222",
    marginBottom: 24,
  },
  button: {
    height: 38,
    borderRadius: 6,
    backgroundColor: "#2f2f2f",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
  loginText: {
    color: "#0000ee",
    fontSize: 15,
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 18,
  },
  bottomStrip: {
    height: 30,
    width: "100%",
    backgroundColor: "#fde5e5",
  },
});
