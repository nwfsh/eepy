// entry point to the app 
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from "./src/context/AuthContext";
import SignInScreen from './src/screens/SignInScreen';
import SignUpScreen from './src/screens/SignUpScreen'
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts, Inter_500Medium, Inter_400Regular, Inter_600SemiBold,Inter_700Bold } from "@expo-google-fonts/inter";
import CompleteProfileScreen from './src/screens/CompleteProfileScreen';

const Stack = createStackNavigator();

export default function App() {

    const [fontsLoaded] = useFonts({
        Inter_500Medium,
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
    });

    if (!fontsLoaded) return null;

return (
    <AuthProvider>
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="SignIn" component={SignInScreen} options = {{ animation : "none"}} />
                <Stack.Screen name="SignUp" component={SignUpScreen} options = {{ animation: "none"}}/>
                <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} options = {{ animation: "none"}}/>
            </Stack.Navigator>
        </NavigationContainer>
    </AuthProvider>
);  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
  },

});

