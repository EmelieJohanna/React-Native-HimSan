import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

export default function ManageTenant() {
  const [houseId, setHouseId] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [tenants, setTenants] = useState([]);
  const [codes, setCodes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchTenants();
    fetchCodes();
    console.log("API URL:", process.env.LOCAL_API_URL);
  }, []);

  const fetchTenants = async () => {
    try {
      const response = await axios.get(`${process.env.LOCAL_API_URL}/tenants`);
      setTenants(response.data);
    } catch (error) {
      console.error(error);
      console.log("API URL:", process.env.LOCAL_API_URL);
    }
  };

  const fetchCodes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4003/registration-codes"
      );
      setCodes(response.data);
      console.log("API URL:", process.env.LOCAL_API_URL);
    } catch (error) {
      console.error(error);
      console.log("API URL:", process.env.LOCAL_API_URL);
    }
  };

  const handleGenerateCode = async () => {
    try {
      const response = await axios.post(
        `${process.env.LOCAL_API_URL}/registration-codes`,
        {
          houseId,
        }
      );
      setRegistrationCode(response.data.code);
      fetchCodes(); // Refresh the codes list
    } catch (error) {
      Alert.alert("Error fetching codes");
    }
  };

  const handleRemoveTenant = async (tenantId) => {
    try {
      await axios.delete(`${process.env.LOCAL_API_URL}/tenants/${tenantId}`);
      fetchTenants(); // Refresh the tenants list
    } catch (error) {
      Alert.alert("Error fetching tenants");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Tenants</Text>
      <TextInput
        placeholder="House ID"
        value={houseId}
        onChangeText={setHouseId}
        style={styles.input}
      />
      <Button title="Generate Registration Code" onPress={handleGenerateCode} />
      {registrationCode ? (
        <Text style={styles.generatedCode}>
          Generated Code: {registrationCode}
        </Text>
      ) : null}
      <Text style={styles.subtitle}>Existing Tenants</Text>
      <FlatList
        data={tenants}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tenantItem}>
            <Text>
              House: {item.house_id} -{item.email}
            </Text>
            <TouchableOpacity onPress={() => handleRemoveTenant(item.id)}>
              <Text style={styles.removeButton}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.subtitle}>Existing Registration Codes</Text>
      <FlatList
        data={codes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.codeItem}>
            <Text>
              Code: {item.code} - House nr: {item.house_id}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  generatedCode: {
    marginVertical: 10,
    fontSize: 16,
    color: "green",
  },
  subtitle: {
    fontSize: 20,
    marginVertical: 10,
  },
  tenantItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  removeButton: {
    color: "red",
  },
  codeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
