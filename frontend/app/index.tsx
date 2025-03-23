import { Colours } from "@/assets/colours";
import { auth } from "@/config/firebase";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import {
  ForgotPasswordScreen,
  LoginScreen,
  RegistrationScreen,
  SettingsScreen,
  SingleTaskScreen,
  TaskListScreen,
} from "../screens";

export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  ForgotPassword: undefined;
  TaskList: undefined;
  SingleTask: undefined | { taskId: string };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const SettingsButton = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
      <Feather name="settings" size={24} color={Colours.neutral.primary} />
    </TouchableOpacity>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6CACE4" />
      </View>
    );
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
      setLoading(false);
    });

    return unsubscribe; // Cleanup on unmount
  }, []);

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="TaskList"
            component={TaskListScreen}
            options={{
              title: "My Tasks",
              headerBackVisible: false,
              headerRight: () => <SettingsButton />,
            }}
          />
          <Stack.Screen
            name="SingleTask"
            component={SingleTaskScreen}
            options={{ title: "Task Details" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Settings" }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: "Login" }}
          />
          <Stack.Screen
            name="Registration"
            component={RegistrationScreen}
            options={{ title: "Register" }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPasswordScreen}
            options={{ title: "Forgot Password" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
