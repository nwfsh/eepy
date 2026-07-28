// entry point to the app 

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from "./src/context/AuthContext";
import LoginScreen from './src/screens/LoginScreen';
import { useFonts, Inter_500Medium, Inter_400Regular, Inter_600SemiBold,Inter_700Bold } from "@expo-google-fonts/inter";

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
    <View style={styles.container}>
        <LoginScreen/>
    </View>
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

