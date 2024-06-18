import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${process.env.LOCAL_API_URL}
/login`,
        {
          email,
          password,
        }
      );

      if (response.data) {
        await AsyncStorage.setItem("userToken", response.data.token);
        await AsyncStorage.setItem("userRole", response.data.role);
        // maybe move this into a  if else for tenant
        await AsyncStorage.setItem("houseId", response.data.house_id);

        if (response.data.role === "admin") {
          router.push("/screens/Admin/AdminDashboard");
        } else if (response.data.role === "tenant") {
          router.push("/screens/Tenant/TenantDashboard");
        }
      }
    } catch (error) {
      Alert.alert("Login failed", "Invalid credentials. Please try again.");
      console.log("API URL:", process.env.LOCAL_API_URL);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
  },
});
