import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  ForgotPasswordScreen,
  LoginScreen,
  RegistrationScreen,
  TaskListScreen,
} from "../screens";

export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  ForgotPassword: undefined;
  TaskList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          title: "Login",
          headerStyle: {
            backgroundColor: "#6CACE4",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "normal",
          },
        }}
      />
      <Stack.Screen
        name="Registration"
        component={RegistrationScreen}
        options={{
          title: "Register",
          headerStyle: {
            backgroundColor: "#6CACE4",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "normal",
          },
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          title: "Forgot Password",
          headerStyle: {
            backgroundColor: "#6CACE4",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "normal",
          },
        }}
      />
      <Stack.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: "My Tasks",
          headerStyle: {
            backgroundColor: "#6CACE4",
          },
          headerTintColor: "#000",
          headerTitleStyle: {
            fontWeight: "normal",
          },
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
}
