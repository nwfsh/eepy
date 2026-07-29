// entry point to the app 
import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from "./src/context/AuthContext";
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen'
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useFonts, Inter_500Medium, Inter_400Regular, Inter_600SemiBold,Inter_700Bold } from "@expo-google-fonts/inter";

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
                <Stack.Screen name="LogIn" component={LoginScreen} options = {{ animation : "none"}} />
                <Stack.Screen name="SignUp" component={SignUpScreen} options = {{ animation: "none"}}/>
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

