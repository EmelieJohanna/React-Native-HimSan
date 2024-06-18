import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";

export default function ManageLaundries() {
  const [numLaundries, setNumLaundries] = useState("");
  const [numTimeSlots, setNumTimeSlots] = useState("");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {}, []);

  const handleNumTimeSlotsChange = (value: string) => {
    setNumTimeSlots(value);
    const num = parseInt(value);
    if (!isNaN(num)) {
      setTimeSlots(Array(num).fill(""));
    } else {
      setTimeSlots([]);
    }
  };

  const handleTimeSlotChange = (index: number, value: string) => {
    const newTimeSlots = [...timeSlots];
    newTimeSlots[index] = value;
    setTimeSlots(newTimeSlots);
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost:4003/laundries", {
        numLaundries: parseInt(numLaundries),
        timeSlots,
      });
      Alert.alert("Success", "Laundries and time slots updated successfully.");
      router.push("/screens/Admin/BookingDashboard");
    } catch (error) {
      Alert.alert("Error updating laundries and time slots");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Laundries</Text>
      <TextInput
        placeholder="Number of laundries"
        value={numLaundries}
        onChangeText={setNumLaundries}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Number of time slots per day"
        value={numTimeSlots}
        onChangeText={handleNumTimeSlotsChange}
        keyboardType="numeric"
        style={styles.input}
      />
      {timeSlots.map((slot, index) => (
        <TextInput
          key={index}
          placeholder={`Time Slot ${index + 1}`}
          value={slot}
          onChangeText={(value) => handleTimeSlotChange(index, value)}
          style={styles.input}
        />
      ))}
      <Button title="Submit" onPress={handleSubmit} />
    </ScrollView>
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
