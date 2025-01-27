import { Fonts } from "@/assets/fonts";
import { CustomInput } from "@/components";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colours } from "../../assets/colours";
import { auth } from "../../config";

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState("");
  const [focusedInput, setFocusedInput] = useState(false);

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset Email Sent",
        "Check your email for a link to reset your password."
      );
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <CustomInput
        label="Enter your email address and we'll send you a link to reset your
        password."
        isFocused={focusedInput}
        placeholder="Email Address"
        value={email}
        onChangeText={setEmail}
        onFocus={() => setFocusedInput(true)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handlePasswordReset}
      >
        <Text style={styles.resetButtonText}>Send Reset Email</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.neutral.white,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colours.neutral.dark1,
    marginBottom: 48,
  },
  resetButton: {
    backgroundColor: Colours.highlight.primary,
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.inter.semiBold,
  },
});

export default ForgotPasswordScreen;
