import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colours } from "../../assets/colours";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailInputIsFocused, setEmailInputIsFocused] = useState(false);
  const [passwordInputIsFocused, setPasswordInputIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header} />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome!</Text>
        <TextInput
          style={[
            styles.input,
            {
              borderColor: emailInputIsFocused
                ? Colours.highlight.primary
                : Colours.neutral.primary,
            },
          ]}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setEmailInputIsFocused(true)}
          onBlur={() => setEmailInputIsFocused(false)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: passwordInputIsFocused
                  ? Colours.highlight.primary
                  : Colours.neutral.primary,
              },
            ]}
            onFocus={() => setPasswordInputIsFocused(true)}
            onBlur={() => setPasswordInputIsFocused(false)}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            <Text>{showPassword ? "🙈" : "👁️"}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={{ alignSelf: "flex-start" }}>
          <Text style={styles.forgotPassword}>Forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.registerText}>
          Not a member? <Text style={styles.registerLink}>Register now</Text>
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
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: Colours.neutral.primary,
    borderRadius: 10,
    paddingLeft: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    padding: 10,
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
});

export default LoginScreen;
