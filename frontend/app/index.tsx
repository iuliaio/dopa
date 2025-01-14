import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens";

const Stack = createNativeStackNavigator();

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
      {/* <Stack.Screen
        name="Tasks"
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
        }}
      /> */}
    </Stack.Navigator>
  );
}
