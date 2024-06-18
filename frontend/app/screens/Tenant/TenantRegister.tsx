import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

export default function TenantRegister() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const router = useRouter();

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:4003/tenants", {
        email,
        password,
        registrationCode,
      });
      Alert.alert("Success", "Tenant registered successfully.");
      router.push("/screens/Login");
    } catch (error) {
      Alert.alert("Registration failed", "Could not register tenant.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tenant Register</Text>
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
      <TextInput
        placeholder="Registration Code"
        value={registrationCode}
        onChangeText={setRegistrationCode}
        style={styles.input}
      />
      <Button title="Register" onPress={handleRegister} />
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
