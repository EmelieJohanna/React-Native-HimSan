import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function TenantDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tenant Dashboard</Text>
      <Button
        title="Book laundry"
        onPress={() => router.push("/screens/Tenant/BookLaundry")}
      />
      <Button
        title="View My Bookings"
        onPress={() => router.push("/screens/Tenant/ViewMyBookings")}
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
