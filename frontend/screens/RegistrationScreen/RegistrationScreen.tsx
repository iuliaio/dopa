import { RootStackParamList } from "@/app";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Colours } from "../../assets/colours";
import { Fonts } from "../../assets/fonts";
import { BaseText, CustomInput } from "../../components";
import { auth } from "../../config";

const RegistrationScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);
  const toggleConfirmPasswordVisibility = () =>
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);

  const toggleCheckbox = () => setIsChecked(!isChecked);

  const canRegister = isChecked && email && password && confirmPassword && name;

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      Alert.alert("Registration Successful", `Welcome, ${name}!`);
    } catch (error) {
      Alert.alert("Registration Failed", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <BaseText style={styles.title}>Sign up</BaseText>
      <BaseText style={styles.subtitle}>
        Create an account to get started
      </BaseText>

      <CustomInput
        label="Name"
        placeholder="Name"
        value={name}
        isFocused={focusedInput === "name"}
        onChangeText={setName}
        onFocus={() => setFocusedInput("name")}
        onBlur={() => setFocusedInput(null)}
      />

      <CustomInput
        label="Email Address"
        placeholder="name@email.com"
        value={email}
        isFocused={focusedInput === "email"}
        onChangeText={setEmail}
        onFocus={() => setFocusedInput("email")}
        onBlur={() => setFocusedInput(null)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <CustomInput
        label="Password"
        placeholder="Create a password"
        value={password}
        isTextVisible={isPasswordVisible}
        onIconPress={togglePasswordVisibility}
        isFocused={focusedInput === "password"}
        onChangeText={setPassword}
        onFocus={() => setFocusedInput("password")}
        onBlur={() => setFocusedInput(null)}
      />

      <CustomInput
        label="Confirm Password"
        placeholder="Confirm password"
        value={confirmPassword}
        isTextVisible={isConfirmPasswordVisible}
        onIconPress={toggleConfirmPasswordVisibility}
        isFocused={focusedInput === "confirmPassword"}
        onChangeText={setConfirmPassword}
        onFocus={() => setFocusedInput("confirmPassword")}
        onBlur={() => setFocusedInput(null)}
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity
          onPress={toggleCheckbox}
          style={[
            styles.checkbox,
            {
              backgroundColor: isChecked
                ? Colours.highlight.primary
                : "transparent",
            },
          ]}
        />
        <BaseText style={styles.termsText}>
          I&apos;ve read and agree with the{" "}
          <BaseText
            style={styles.link}
            onPress={() => Linking.openURL("https://terms.example.com")}
          >
            Terms and Conditions
          </BaseText>{" "}
          and the{" "}
          <BaseText
            style={styles.link}
            onPress={() => Linking.openURL("https://privacy.example.com")}
          >
            Privacy Policy
          </BaseText>
          .
        </BaseText>
      </View>

      <TouchableOpacity
        style={[styles.registerButton, { opacity: !canRegister ? 0.5 : 1 }]}
        onPress={() => {
          handleRegister();
          navigation.navigate("Login");
        }}
        disabled={!canRegister}
      >
        <BaseText style={styles.registerButtonText}>Register</BaseText>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colours.neutral.white,
    gap: 8,
  },
  title: {
    fontFamily: Fonts.inter.bold,
    color: Colours.neutral.dark1,
  },
  subtitle: {
    fontSize: 12,
    color: Colours.neutral.dark3,
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colours.highlight.primary,
    borderRadius: 4,
    marginRight: 10,
  },
  termsText: {
    flex: 1,
    color: Colours.neutral.dark3,
    fontSize: 14,
  },
  link: {
    color: Colours.highlight.primary,
    textDecorationLine: "underline",
    fontSize: 14,
  },
  registerButton: {
    marginTop: 20,
    backgroundColor: Colours.highlight.primary,
    borderRadius: 10,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  registerButtonText: {
    fontFamily: Fonts.inter.bold,
    fontSize: 16,
    color: "#fff",
  },
});

export default RegistrationScreen;
