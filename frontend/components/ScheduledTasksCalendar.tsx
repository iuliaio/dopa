import React from "react";
import { StyleSheet, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";

type Props = {
  selectedDate: string | undefined;
  setSelectedDate: (date: string) => void;
};

const ScheduledTasksCalendar: React.FC<Props> = ({
  selectedDate,
  setSelectedDate,
}) => {
  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate || ""]: {
            selected: true,
            marked: true,
            selectedColor: "blue",
          },
        }}
      />
    </View>
  );
};

export default ScheduledTasksCalendar;

const styles = StyleSheet.create({
  container: { flex: 1, marginVertical: 4 },
});
