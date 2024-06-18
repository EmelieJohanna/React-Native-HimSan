import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Button
        title="Manage Tenants"
        onPress={() => router.push("/screens/Admin/ManageTenants")}
      />
      <Button
        title="Manage Laundries"
        onPress={() => router.push("/screens/Admin/ManageLaundries")}
      />
      <Button
        title="View Bookings"
        onPress={() => router.push("/screens/Admin/BookingDashboard")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
