import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  Button,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Calendar } from "react-native-calendars";
import axios from "axios";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AvailableDates {
  [key: string]: {
    marked: boolean;
    dotColor: string;
  };
}

interface CalendarDay {
  dateString: string;
  day: number;
  month: number;
  year: number;
  timestamp: number;
}

export default function BookLaundry() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<AvailableDates>({});
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null); // State for selected timeslot
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchAvailableDates(
      moment().startOf("month").format("YYYY-MM-DD"),
      moment().endOf("month").format("YYYY-MM-DD")
    );
  }, []);

  const fetchAvailableDates = async (startDate: string, endDate: string) => {
    try {
      const response = await axios.get(
        "http://localhost:4003/available-dates",
        {
          params: { startDate, endDate },
        }
      );
      const dates: AvailableDates = {};
      for (const date in response.data) {
        dates[date] = { marked: true, dotColor: "green" };
      }
      console.log("Available Dates Response:", response.data);
      setAvailableDates(dates);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTimeSlots = async (date: string) => {
    try {
      const response = await axios.get(
        "http://localhost:4003/available-dates",
        {
          params: { startDate: date, endDate: date },
        }
      );
      console.log("Time Slots Response for date", date, ":", response.data); // Debug log
      setTimeSlots(response.data[date] || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDayPress = (day: CalendarDay) => {
    setSelectedDate(day.dateString);
    fetchTimeSlots(day.dateString);
    setModalVisible(true);
  };

  const handleBookTimeSlot = async () => {
    try {
      const houseId = await AsyncStorage.getItem("houseId"); // Get houseId from AsyncStorage

      if (!houseId) {
        Alert.alert("No House ID found.");
        return;
      }
      if (!selectedTimeSlot) {
        Alert.alert("No time slot selected.");
        return;
      }
      await axios.post("http://localhost:4003/book", {
        house_id: houseId,
        laundry_id: 9,
        date: selectedDate,
        time_slot: selectedTimeSlot,
      });
      Alert.alert("Success", "Booking successful");
      setModalVisible(false);
      setSelectedTimeSlot(null); // Reset the selected time slot
      fetchAvailableDates(
        moment(selectedDate).startOf("month").format("YYYY-MM-DD"),
        moment(selectedDate).endOf("month").format("YYYY-MM-DD")
      );
    } catch (error) {
      Alert.alert("Error booking timeslot");
    }
  };

  const handleMonthChange = (month: CalendarDay) => {
    fetchAvailableDates(
      moment(month.dateString).startOf("month").format("YYYY-MM-DD"),
      moment(month.dateString).endOf("month").format("YYYY-MM-DD")
    );
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        markedDates={availableDates}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Available Time Slots for {selectedDate}
            </Text>
            <FlatList
              data={timeSlots}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedTimeSlot(item)}
                  style={[
                    styles.timeSlot,
                    selectedTimeSlot === item && styles.selectedTimeSlot,
                  ]}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <View style={styles.buttonContainer}>
              <Button title="OK" onPress={handleBookTimeSlot} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around", // This will space the buttons evenly
    marginTop: 20,
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
  timeSlot: {
    padding: 10,
    fontSize: 16,
    color: "green",
  },
  selectedTimeSlot: {
    backgroundColor: "#d3d3d3", // Change color to indicate selection
  },
});
