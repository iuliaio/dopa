import { RootStackParamList } from "@/app";
import { CustomInput } from "@/components";
import { auth } from "@/config/firebase";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail, signOut, updateProfile } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colours } from "../../assets/colours";
import { Fonts } from "../../assets/fonts";

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      setName(auth.currentUser.displayName || "");
      setEmail(auth.currentUser.email || "");
    }
  }, []);

  const handleUpdateName = async () => {
    if (!auth.currentUser) return;

    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
      });
      Alert.alert("Success", "Name updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update name. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    if (!auth.currentUser?.email) return;

    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      Alert.alert(
        "Success",
        "Password reset email sent. Please check your inbox."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send password reset email. Please try again."
      );
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("Login");
    } catch (error) {
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <CustomInput
          label="Name"
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          isFocused={focusedInput === "name"}
          onFocus={() => setFocusedInput("name")}
          onBlur={() => setFocusedInput(null)}
        />
        <TouchableOpacity style={styles.button} onPress={handleUpdateName}>
          <Text style={styles.buttonText}>Update Name</Text>
        </TouchableOpacity>

        <CustomInput
          label="Email"
          value={email}
          editable={false}
          isFocused={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Reset Password</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
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
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: Colours.neutral.dark1,
    fontFamily: Fonts.inter.bold,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: Colours.neutral.dark2,
    fontFamily: Fonts.inter.semiBold,
  },
  button: {
    backgroundColor: Colours.highlight.primary,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.inter.semiBold,
  },
  logoutButton: {
    backgroundColor: Colours.neutral.light,
    marginTop: "auto",
  },
  logoutText: {
    color: Colours.neutral.dark1,
  },
});

export default SettingsScreen;
