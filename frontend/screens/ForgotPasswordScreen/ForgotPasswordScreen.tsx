import { Fonts } from "@/assets/fonts";
import { BaseText, CustomInput } from "@/components";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
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
      <BaseText style={styles.title}>Forgot your password?</BaseText>
      <View style={styles.descriptionContainer}>
        <BaseText>
          Enter your registered email address and we will send you a link to
          reset it.
        </BaseText>
        <BaseText size={14}>
          Please check your spam folder if you do not see the email in your
          inbox.
        </BaseText>
      </View>
      <CustomInput
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
  descriptionContainer: {
    gap: 4,
  },
});

export default ForgotPasswordScreen;
