import { RootStackParamList } from "@/app";
import { CustomInput } from "@/components";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colours } from "../../assets/colours";
import { auth } from "../../config";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const { user, promptAsync } = useGoogleAuth(); // Hook for Google login

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      navigation.navigate("TaskList");
    } catch (error) {
      Alert.alert("Login Failed", (error as Error).message);
    }
  };

  // Handle Google Sign-In
  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result?.type === "success") {
        console.log("Google Sign-In Successful");

        // Firebase Auth is handled inside useGoogleAuth.ts, so no need to sign in here
        navigation.navigate("TaskList"); // ✅ Navigate after login
      } else {
        console.warn("Google Sign-In Cancelled");
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      Alert.alert("Google Sign-In Failed");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome!</Text>
        <CustomInput
          label="Email Address"
          isFocused={focusedInput === "email"}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setFocusedInput("email")}
          onBlur={() => setFocusedInput(null)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <CustomInput
          label="Password"
          placeholder="Password"
          value={password}
          isTextVisible={showPassword}
          onIconPress={togglePasswordVisibility}
          isFocused={focusedInput === "password"}
          onChangeText={setPassword}
          onFocus={() => setFocusedInput("password")}
          onBlur={() => setFocusedInput(null)}
        />
        <TouchableOpacity
          style={{ alignSelf: "flex-start" }}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={!email || !password}
        >
          <Text style={styles.loginButtonText}>Login</Text>
          {/* TODO */}
        </TouchableOpacity>

        {/* Google Login Button */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
        >
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <Text style={styles.registerText}>
          Not a member?{" "}
          <Text
            style={styles.registerLink}
            onPress={() => navigation.navigate("Registration")}
          >
            Register now
          </Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.neutral.light,
  },
  header: {
    flex: 2,
    backgroundColor: Colours.neutral.light,
  },
  content: {
    flex: 3,
    backgroundColor: Colours.neutral.white,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "left",
    width: "100%",
  },
  forgotPassword: {
    color: Colours.neutral.primary,
  },
  loginButton: {
    backgroundColor: Colours.neutral.primary,
    borderRadius: 10,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerText: {
    color: "#666",
  },
  registerLink: {
    color: Colours.highlight.primary,
    fontWeight: "bold",
  },
  googleButton: {
    backgroundColor: Colours.highlight.primary,
    borderRadius: 10,
    width: "100%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default LoginScreen;
