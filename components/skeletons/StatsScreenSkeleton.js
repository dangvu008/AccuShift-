"use client"
import { View, StyleSheet } from "react-native"
import { useTheme } from "../../hooks"
import Skeleton from "../ui/Skeleton"

const StatsScreenSkeleton = () => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Month Selector */}
      <View style={[styles.monthSelector, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={24} height={24} borderRadius={12} />
        <Skeleton width={150} height={24} borderRadius={4} />
        <Skeleton width={24} height={24} borderRadius={12} />
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        {[...Array(3)].map((_, index) => (
          <View key={index} style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Skeleton width={48} height={48} borderRadius={24} style={styles.summaryIcon} />
            <Skeleton width={40} height={24} borderRadius={4} style={styles.summaryValue} />
            <Skeleton width={80} height={16} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Chart */}
      <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={150} height={24} borderRadius={4} style={styles.chartTitle} />
        <View style={styles.chart}>
          <Skeleton width={200} height={200} borderRadius={100} />
        </View>
      </View>

      {/* Daily Stats */}
      <View style={[styles.dailyStatsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={150} height={24} borderRadius={4} style={styles.dailyStatsTitle} />

        {/* Y-axis labels */}
        <View style={styles.chartContainer}>
          <View style={styles.yAxis}>
            <Skeleton width={30} height={16} borderRadius={4} />
            <Skeleton width={30} height={16} borderRadius={4} />
            <Skeleton width={30} height={16} borderRadius={4} />
          </View>

          {/* Bars */}
          <View style={styles.barsContainer}>
            {[...Array(7)].map((_, index) => (
              <View key={index} style={styles.barColumn}>
                <Skeleton width={20} height={Math.random() * 100 + 20} borderRadius={4} style={styles.bar} />
                <Skeleton width={20} height={16} borderRadius={4} style={styles.barLabel} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    width: "31%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  summaryIcon: {
    marginBottom: 8,
  },
  summaryValue: {
    marginBottom: 4,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    alignItems: "center",
  },
  chartTitle: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  chart: {
    alignItems: "center",
    justifyContent: "center",
    height: 220,
  },
  dailyStatsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  dailyStatsTitle: {
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    height: 150,
  },
  yAxis: {
    width: 40,
    justifyContent: "space-between",
    paddingRight: 8,
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  barColumn: {
    alignItems: "center",
  },
  bar: {
    marginBottom: 8,
  },
  barLabel: {},
})

export default StatsScreenSkeleton
