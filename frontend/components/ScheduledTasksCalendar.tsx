import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import BaseText from "./BaseText";

const ScheduledTasksCalendar = () => {
  const [selectedDate, setSelectedDate] = useState("");

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: {
            selected: true,
            marked: true,
            selectedColor: "blue",
          },
        }}
      />
      <BaseText style={styles.text}>Selected Date: {selectedDate}</BaseText>
    </View>
  );
};

export default ScheduledTasksCalendar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginVertical: 4,
  },
  text: { fontSize: 14, paddingTop: 4 },
});
