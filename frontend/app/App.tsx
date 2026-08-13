// entry point to the app
import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { RootTagContext, StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import SignInScreen from "./src/screens/SignInScreen";
import SignUpScreen from "./src/screens/SignUpScreen";
import CreateProfileScreen from './src/screens/CreateProfileScreen'
import MorningHomeScreen from "./src/screens/MorningHomeScreen";
import RelationshipCodeScreen from './src/screens/RelationshipCodeScreen'
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Stack = createStackNavigator();

const PERSISTENCE_KEY = "NAVIGATION_STATE";

function RootNavigator() {
    const { session, loading } = useAuth();
    const [ isReady, setIsReady ] = useState(false);
    const [initialState, setInitialState] = useState();
const { signOut } = useAuth();



    // purely for persistnence 
     useEffect(() => {
         const restoreState = async () => {
             try {
                 const savedState = await AsyncStorage.getItem(PERSISTENCE_KEY);
                 if (savedState) {
                     setInitialState(JSON.parse(savedState));
                 }
             } finally {
                 setIsReady(true);
             }
         };
         restoreState();
     }, []);

    if (loading) return null;

    
    return (
        <SafeAreaProvider>
            <NavigationContainer
                initialState={initialState}
                onStateChange={(state) =>
                    AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))
                }
            >
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    {session ? (
                        <>
                            <Stack.Screen
                                name="CreateProfile"
                                component={CreateProfileScreen}
                            />
                            <Stack.Screen
                                name="SleepSchedule"
                                component={SleepScheduleScreen}
                            />
                            <Stack.Screen
                                name="RelationshipCode"
                                component={RelationshipCodeScreen}
                            />
                            <Stack.Screen
                                name="MorningHomeScreen"
                                component={MorningHomeScreen}
                            />
                            {/* later: RelationshipCode, Home, etc. */}
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}


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
        <RootNavigator/>
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
