import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Booking {
  date: string;
  time_slot: string;
  laundry_id: number;
}

export default function ViewMyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const houseId = await AsyncStorage.getItem("houseId"); // Get houseId from AsyncStorage

      if (!houseId) {
        Alert.alert("No House ID found.");
        return;
      }

      const response = await axios.get("http://localhost:4003/my-bookings", {
        params: { house_id: houseId },
      });
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error fetching bookings");
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <View style={styles.bookingItem}>
      <Text style={styles.bookingText}>Date: {item.date}</Text>
      <Text style={styles.bookingText}>Time Slot: {item.time_slot}</Text>
      <Text style={styles.bookingText}>Laundry ID: {item.laundry_id}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderBookingItem}
        ListEmptyComponent={<Text>No bookings found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  bookingItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  bookingText: {
    fontSize: 18,
  },
});
