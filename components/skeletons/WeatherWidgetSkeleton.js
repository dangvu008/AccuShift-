"use client"
import { View, StyleSheet } from "react-native"
import { useTheme } from "../../hooks"
import Skeleton from "../ui/Skeleton"

const WeatherWidgetSkeleton = () => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      {/* Current Weather */}
      <View style={styles.currentWeather}>
        <View style={styles.weatherMain}>
          <Skeleton width={64} height={64} borderRadius={32} />
          <View style={styles.weatherInfo}>
            <Skeleton width={80} height={32} borderRadius={4} style={styles.temperature} />
            <Skeleton width={150} height={16} borderRadius={4} />
          </View>
        </View>

        <View style={styles.weatherDetails}>
          <Skeleton width={80} height={16} borderRadius={4} style={styles.detailItem} />
          <Skeleton width={80} height={16} borderRadius={4} />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Skeleton width={100} height={16} borderRadius={4} />
        <Skeleton width={80} height={16} borderRadius={4} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  currentWeather: {
    padding: 16,
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
  temperature: {
    marginBottom: 8,
  },
  weatherDetails: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  detailItem: {
    marginRight: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
  },
})

export default WeatherWidgetSkeleton
