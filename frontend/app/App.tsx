// entry point to the app 

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { AuthProvider } from "./src/context/AuthContext";
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
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
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

