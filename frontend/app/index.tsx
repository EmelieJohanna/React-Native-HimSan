import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Link, useRouter } from "expo-router";

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const handleRegister = (role: string) => {
    setModalVisible(false);
    if (role === "admin") {
      router.push("/screens/Admin/AdminRegister");
    } else if (role === "tenant") {
      router.push("/screens/Tenant/TenantRegister");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the Laundry App</Text>
      <View style={styles.buttonContainer}>
        <Link href="/screens/Login">
          <Button title="Login" onPress={() => router.push("/screens/Login")} />
        </Link>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Register" onPress={() => setModalVisible(true)} />
      </View>
      {/* <View style={styles.buttonContainer}>
        <Link href="/screens/Login">
          <Button title="Login" />
        </Link>
      </View> */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Register as</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleRegister("admin")}
            >
              <Text style={styles.modalButtonText}>Admin</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleRegister("tenant")}
            >
              <Text style={styles.modalButtonText}>Tenant</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    marginVertical: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  modalButton: {
    marginVertical: 10,
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 5,
  },
  modalButtonText: {
    color: "white",
    fontSize: 18,
  },
});
