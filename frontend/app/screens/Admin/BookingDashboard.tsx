import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import moment from "moment";

export default function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [laundries, setLaundries] = useState([]);
  const [currentDate, setCurrentDate] = useState(moment());
  const router = useRouter();

  useEffect(() => {
    fetchBookings();
    fetchLaundries();
  }, [currentDate]);

  const fetchBookings = async () => {
    const startOfWeek = currentDate.clone().startOf("isoWeek");
    const endOfWeek = currentDate.clone().endOf("isoWeek");

    try {
      const response = await axios.get("http://localhost:4003/bookings", {
        params: {
          startDate: startOfWeek.format("YYYY-MM-DD"),
          endDate: endOfWeek.format("YYYY-MM-DD"),
        },
      });
      setBookings(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLaundries = async () => {
    try {
      const response = await axios.get("http://localhost:4003/laundries");
      setLaundries(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const nextWeek = () => {
    setCurrentDate(currentDate.clone().add(1, "week"));
  };

  const prevWeek = () => {
    setCurrentDate(currentDate.clone().subtract(1, "week"));
  };

  const renderCalendar = () => {
    const daysOfWeek = [];
    const startOfWeek = currentDate.clone().startOf("isoWeek");

    for (let i = 0; i < 7; i++) {
      daysOfWeek.push(startOfWeek.clone().add(i, "day"));
    }

    return (
      <View style={styles.table}>
        <View style={styles.tableRow}>
          <View style={styles.tableCell}>
            <Text>Week {currentDate.isoWeek()}</Text>
          </View>
          {daysOfWeek.map((day) => (
            <View style={styles.tableCell} key={day.format("YYYY-MM-DD")}>
              <Text>{day.format("ddd (MM/DD)")}</Text>
            </View>
          ))}
        </View>
        {laundries.length > 0 &&
          laundries[0].timeSlots.map((slot, rowIndex) => (
            <View style={styles.tableRow} key={rowIndex}>
              <View style={styles.tableCell}>
                <Text>{slot.time_slot}</Text>
              </View>
              {daysOfWeek.map((day, colIndex) => (
                <View style={styles.tableCell} key={colIndex}>
                  {renderBookingCell(day, slot.time_slot)}
                </View>
              ))}
            </View>
          ))}
      </View>
    );
  };

  const renderBookingCell = (day, slot) => {
    const dayBookings = bookings.filter(
      (booking) =>
        moment(booking.timeslot).isSame(day, "day") &&
        booking.timeslot.includes(slot)
    );

    if (dayBookings.length > 0) {
      return <Text>X</Text>;
    } else {
      return <Text></Text>;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Booking Dashboard</Text>
      <Text style={styles.date}>{moment().format("dddd, MMMM Do YYYY")}</Text>
      {renderCalendar()}
      <View style={styles.buttonContainer}>
        <Button title="Previous Week" onPress={prevWeek} />
        <Button title="Next Week" onPress={nextWeek} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  date: {
    fontSize: 18,
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});
