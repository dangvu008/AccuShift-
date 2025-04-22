import { View, StyleSheet } from "react-native"
import { useTheme } from "../../hooks"
import Skeleton from "../ui/Skeleton"

const HomeScreenSkeleton = () => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <Skeleton width={120} height={40} borderRadius={4} style={styles.timeText} />
          <Skeleton width={200} height={20} borderRadius={4} style={styles.dateText} />
        </View>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      {/* Current Shift Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={150} height={24} borderRadius={4} style={styles.cardTitle} />
        <View style={styles.shiftDetails}>
          <Skeleton width={180} height={28} borderRadius={4} />
          <Skeleton width={100} height={20} borderRadius={4} />
        </View>
      </View>

      {/* Action Button */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.actionButtonContainer}>
          <Skeleton width={200} height={200} borderRadius={100} />
        </View>
      </View>

      {/* Weather Widget */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.weatherContainer}>
          <View style={styles.weatherMain}>
            <Skeleton width={64} height={64} borderRadius={32} />
            <View style={styles.weatherInfo}>
              <Skeleton width={80} height={32} borderRadius={4} style={styles.tempText} />
              <Skeleton width={150} height={20} borderRadius={4} />
            </View>
          </View>
          <View style={styles.weatherDetails}>
            <Skeleton width={100} height={20} borderRadius={4} style={styles.weatherDetail} />
            <Skeleton width={100} height={20} borderRadius={4} style={styles.weatherDetail} />
          </View>
        </View>
      </View>

      {/* Week Status Grid */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={150} height={24} borderRadius={4} style={styles.cardTitle} />
        <View style={styles.weekGrid}>
          {[...Array(7)].map((_, index) => (
            <View key={index} style={styles.dayCell}>
              <Skeleton width={30} height={16} borderRadius={4} style={styles.dayName} />
              <Skeleton width={24} height={24} borderRadius={4} style={styles.dayNumber} />
              <Skeleton width={24} height={24} borderRadius={12} />
            </View>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.notesHeader}>
          <Skeleton width={150} height={24} borderRadius={4} />
          <Skeleton width={24} height={24} borderRadius={12} />
        </View>
        {[...Array(2)].map((_, index) => (
          <View key={index} style={styles.noteItem}>
            <Skeleton width={250} height={20} borderRadius={4} style={styles.noteTitle} />
            <Skeleton width={300} height={16} borderRadius={4} style={styles.noteContent} />
            <Skeleton width={100} height={16} borderRadius={4} style={styles.noteTime} />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateTimeContainer: {
    flex: 1,
  },
  timeText: {
    marginBottom: 8,
  },
  dateText: {},
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    marginBottom: 12,
  },
  shiftDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  weatherContainer: {
    paddingVertical: 8,
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  weatherInfo: {
    marginLeft: 16,
    flex: 1,
  },
  tempText: {
    marginBottom: 8,
  },
  weatherDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weatherDetail: {
    marginRight: 16,
  },
  weekGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  dayCell: {
    alignItems: "center",
    width: 40,
  },
  dayName: {
    marginBottom: 8,
  },
  dayNumber: {
    marginBottom: 8,
  },
  notesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  noteItem: {
    marginBottom: 16,
  },
  noteTitle: {
    marginBottom: 8,
  },
  noteContent: {
    marginBottom: 8,
  },
  noteTime: {},
})

export default HomeScreenSkeleton
