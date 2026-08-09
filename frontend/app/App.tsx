// entry point to the app
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider } from "./src/context/AuthContext";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import CreateProfileScreen from './src/screens/CreateProfileScreen'
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  useFonts,
  Inter_500Medium,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Asset } from "expo-asset";
import { useEffect, useState } from "react";
import SleepScheduleScreen from "./src/screens/SleepScheduleScreen";

const Stack = createStackNavigator();

export default function App() {
  const [assetsToPreload] = [
      require("./src/assets/tinified/onboardingsun.png"),
      require("./src/assets/tinified/onboardingmoon.png"),
      require("./src/assets/tinified/myblotch.png"),
      require("./src/assets/tinified/myotherblotch.png"),
      require("./src/assets/tinified//onboardingButtonFinal.png"),
      require("./src/assets/tinified/whiteblobother.png"),
      require("./src/assets/tinified/whiteblob.png"),
  ];

  const [fontsLoaded] = useFonts({
    Inter_500Medium,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    Asset.loadAsync(assetsToPreload).then(() => setAssetsLoaded(true));
  }, []);

  if (!fontsLoaded) return null;
  if (!assetsLoaded) return null;

  // rmb to run a cron job at hte creation of a new relationship 
  return (
      <AuthProvider>
          <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen
                      name="SignIn"
                      component={SignInScreen}
                      options={{ animation: "fade" }}
                  />
                  <Stack.Screen
                      name="SignUp"
                      component={SignUpScreen}
                      options={{ animation: "fade" }}
                  />
                  <Stack.Screen
                      name="CreateProfile"
                      component={CreateProfileScreen}
                      options={{ animation: "default" }}
                  />
                  <Stack.Screen
                    name="SleepSchedule"
                    component={SleepScheduleScreen}
                    options={{ animation: "default" }}/>
              </Stack.Navigator>
          </NavigationContainer>
      </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
    justifyContent: "center",
  },
});
