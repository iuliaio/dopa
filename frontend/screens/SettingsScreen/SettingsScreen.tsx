import { RootStackParamList } from "@/app";
import { BaseText, CustomInput } from "@/components";
import { auth } from "@/config/firebase";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { sendPasswordResetEmail, signOut, updateProfile } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Button,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { Colours } from "../../assets/colours";
import { Fonts } from "../../assets/fonts";

if (Platform.OS === "android") {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

type AccordionSection = {
  id: string;
  title: string;
  content: React.ReactNode;
};

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [offsetMinutes, setOffsetMinutes] = useState(0);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const animatedValues = useRef<{
    [key: string]: { height: Animated.Value; opacity: Animated.Value };
  }>({});

  useEffect(() => {
    if (auth.currentUser) {
      setName(auth.currentUser.displayName || "");
      setEmail(auth.currentUser.email || "");
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setTimeZone(timeZone);
    setOffsetMinutes(new Date().getTimezoneOffset());
  }, []);

  const handleUpdateName = async () => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: name });
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
      Alert.alert("Error", "Failed to send password reset email.");
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

  const sections: AccordionSection[] = [
    {
      id: "personal",
      title: "Personal Details",
      content: (
        <>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <View style={{ flex: 1, maxWidth: "60%" }}>
              <CustomInput
                label="Name"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                isFocused={focusedInput === "name"}
                onFocus={() => setFocusedInput("name")}
                onBlur={() => setFocusedInput(null)}
                style={{ height: 32, marginTop: 8 }}
              />
            </View>
            <Button title="Update" onPress={handleUpdateName} />
          </View>
          <View style={styles.emailContainer}>
            <BaseText variant="semiBold" size={14}>
              Email
            </BaseText>
            <BaseText variant="regular" size={16}>
              {email}
            </BaseText>
          </View>
        </>
      ),
    },
    {
      id: "timezone",
      title: "Time zone",
      content: (
        <View
          style={[
            styles.accordionContentInner,
            {
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            },
          ]}
        >
          <BaseText variant="regular" size={14}>
            <BaseText variant="semiBold" size={14}>
              Current timezone:
            </BaseText>{" "}
            {timeZone} (UTC{offsetMinutes <= 0 ? " +" : " -"}
            {Math.abs(offsetMinutes / 60)})
          </BaseText>
        </View>
      ),
    },
    {
      id: "notifications",
      title: "Notifications",
      content: (
        <View style={styles.accordionContentInner}>
          <BaseText variant="regular" size={16}>
            Manage your notification preferences
          </BaseText>
          <TouchableOpacity style={styles.contentButton}>
            <Text style={styles.contentButtonText}>
              Configure notifications
            </Text>
          </TouchableOpacity>
        </View>
      ),
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      content: (
        <View style={styles.accordionContentInner}>
          <BaseText variant="regular" size={16}>
            Manage your privacy settings
          </BaseText>
          <TouchableOpacity
            style={styles.contentButton}
            onPress={handleResetPassword}
          >
            <Text style={styles.contentButtonText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      ),
    },
  ];

  useEffect(() => {
    sections.forEach((section) => {
      if (!animatedValues.current[section.id]) {
        animatedValues.current[section.id] = {
          height: new Animated.Value(0),
          opacity: new Animated.Value(0),
        };
      }
    });
  }, []);

  const toggleAccordion = (sectionId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const isExpanded = expandedSections.includes(sectionId);
    const toValue = isExpanded ? 0 : 1;

    Animated.parallel([
      Animated.timing(animatedValues.current[sectionId].height, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(animatedValues.current[sectionId].opacity, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();

    setExpandedSections((prev) =>
      isExpanded ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <BaseText variant="regular" size={26} style={styles.avatarText}>
              {name[0] || "N"}
            </BaseText>
          </View>
        </View>
      </View>

      <View style={styles.settingsList}>
        {sections.map((section) => (
          <View key={section.id}>
            <TouchableOpacity
              style={[
                styles.optionRow,
                {
                  borderBottomWidth: expandedSections.includes(section.id)
                    ? 0
                    : 1,
                },
              ]}
              activeOpacity={1}
              onPress={() => toggleAccordion(section.id)}
            >
              <Text style={styles.optionText}>{section.title}</Text>
              <Feather
                name={
                  expandedSections.includes(section.id)
                    ? "chevron-up"
                    : "chevron-down"
                }
                size={20}
                color={Colours.neutral.dark3}
              />
            </TouchableOpacity>
            <Animated.View
              style={[
                styles.accordionContent,
                {
                  maxHeight: animatedValues.current[
                    section.id
                  ]?.height.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 300],
                  }),
                  opacity: animatedValues.current[section.id]?.opacity,
                  overflow: "hidden",
                },
              ]}
            >
              {section.content}
            </Animated.View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colours.neutral.white,
    paddingHorizontal: 24,
  },
  header: {
    fontSize: 20,
    fontFamily: Fonts.inter.semiBold,
    textAlign: "center",
    marginTop: 24,
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 32,
  },
  avatarContainer: {
    position: "relative",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colours.neutral.lightest,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colours.highlight.tertiary,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 24,
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
    marginTop: 24,
    marginBottom: 24,
  },
  logoutText: {
    color: Colours.neutral.dark1,
  },
  settingsList: {
    marginTop: 12,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomColor: Colours.highlight.tertiary,
  },
  optionText: {
    fontSize: 16,
    fontFamily: Fonts.inter.regular,
    color: Colours.neutral.dark1,
  },
  accordionContent: {
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomColor: Colours.highlight.tertiary,
    borderBottomWidth: 1,
  },
  accordionContentInner: {
    gap: 12,
  },
  avatarText: {
    color: Colours.neutral.dark1,
    textAlign: "center",
  },
  emailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  contentButton: {
    backgroundColor: Colours.highlight.tertiary,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  contentButtonText: {
    color: Colours.neutral.dark1,
    fontSize: 14,
    fontFamily: Fonts.inter.regular,
  },
});

export default SettingsScreen;
