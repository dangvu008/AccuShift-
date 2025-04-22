"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format, startOfWeek, startOfMonth, startOfYear, endOfWeek, endOfMonth, endOfYear, subMonths } from "date-fns"
import { useTheme, useTranslation, useWork } from "../hooks"
import { MonthSelector, StatsSummaryCard, StatusPieChart, DailyHoursChart, DailyStatusList } from "../components/stats"

const StatisticsScreen = () => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { getMonthStats, exportMonthlyReport, dailyWorkStatus } = useWork()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedPeriod, setSelectedPeriod] = useState("month") // week, month, year, custom
  const [dateRange, setDateRange] = useState({ start: null, end: null })
  const [monthStats, setMonthStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState("summary") // 'summary' or 'daily'

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    success: "#4CD964",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#5AC8FA",
    purple: "#AF52DE",
    gray: "#8E8E93",
    yellow: "#FFCC00",
  }

  // Load stats when date or period changes
  useEffect(() => {
    loadStats()
  }, [selectedDate, selectedPeriod, loadStats])

  // Calculate date range based on selected period
  useEffect(() => {
    let start, end

    switch (selectedPeriod) {
      case "week":
        start = startOfWeek(selectedDate, { weekStartsOn: 1 })
        end = endOfWeek(selectedDate, { weekStartsOn: 1 })
        break
      case "month":
        start = startOfMonth(selectedDate)
        end = endOfMonth(selectedDate)
        break
      case "year":
        start = startOfYear(selectedDate)
        end = endOfYear(selectedDate)
        break
      case "custom":
        // Keep existing custom range
        return
      default:
        start = startOfMonth(selectedDate)
        end = endOfMonth(selectedDate)
    }

    setDateRange({ start, end })
  }, [selectedDate, selectedPeriod])

  // Load statistics data
  const loadStats = async () => {
    try {
      setIsLoading(true)

      // In a real app, you would fetch data for the selected period
      // For now, we'll use the month stats function
      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth() + 1

      const stats = await getMonthStats(year, month)
      setMonthStats(stats)
    } catch (error) {
      console.error("Error loading stats:", error)
      Alert.alert("Error", "Failed to load statistics")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle previous month
  const handlePreviousMonth = () => {
    setSelectedDate((prevDate) => subMonths(prevDate, 1))
  }

  // Handle next month
  const handleNextMonth = () => {
    const nextMonth = new Date(selectedDate)
    nextMonth.setMonth(nextMonth.getMonth() + 1)

    // Don't allow selecting future months
    if (nextMonth <= new Date()) {
      setSelectedDate(nextMonth)
    }
  }

  // Handle period selection
  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period)
  }

  // Handle export report
  const handleExportReport = async () => {
    try {
      setIsExporting(true)

      const year = selectedDate.getFullYear()
      const month = selectedDate.getMonth() + 1

      const report = await exportMonthlyReport(year, month)

      // In a real app, you would generate a file or share the report
      // For now, we'll just show a success message
      await Share.share({
        message: `Work Report - ${format(selectedDate, "MMMM yyyy")}\n\nTotal Days: ${report.summary.totalDays}\nFull Work: ${report.summary.fullWork}\nTotal Hours: ${report.summary.totalHours}`,
        title: `Work Report - ${format(selectedDate, "MMMM yyyy")}`,
      })
    } catch (error) {
      console.error("Error exporting report:", error)
      Alert.alert("Error", "Failed to export report")
    } finally {
      setIsExporting(false)
    }
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "full_work":
        return theme.success
      case "missing_action":
        return theme.warning
      case "leave":
        return theme.info
      case "sick":
        return theme.error
      case "holiday":
        return theme.purple
      case "absent":
        return theme.gray
      case "late_early":
        return theme.yellow
      default:
        return theme.gray
    }
  }

  // Prepare chart data
  const prepareChartData = () => {
    if (!monthStats) return []

    return [
      { name: "Full Work", value: monthStats.stats.fullWork, color: theme.success },
      { name: "Missing Action", value: monthStats.stats.missingAction, color: theme.warning },
      { name: "Leave", value: monthStats.stats.leave, color: theme.info },
      { name: "Sick", value: monthStats.stats.sick, color: theme.error },
      { name: "Holiday", value: monthStats.stats.holiday, color: theme.purple },
      { name: "Absent", value: monthStats.stats.absent, color: theme.gray },
      { name: "Late/Early", value: monthStats.stats.lateEarly, color: theme.yellow },
    ].filter((item) => item.value > 0)
  }

  // Format month for API
  const formatMonthForApi = () => {
    const year = selectedDate.getFullYear()
    const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0")
    return `${year}-${month}`
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t("common.loading")}</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t("stats.title")}</Text>

          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: theme.primary }]}
            onPress={handleExportReport}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="download-outline" size={16} color="#FFFFFF" style={styles.exportIcon} />
                <Text style={styles.exportText}>{t("stats.export")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <View style={[styles.periodSelector, { backgroundColor: theme.card }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodOptions}>
            <TouchableOpacity
              style={[
                styles.periodOption,
                selectedPeriod === "week" && [styles.activePeriod, { borderColor: theme.primary }],
              ]}
              onPress={() => handlePeriodSelect("week")}
            >
              <Text
                style={[styles.periodText, { color: selectedPeriod === "week" ? theme.primary : theme.textSecondary }]}
              >
                {t("stats.thisWeek")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodOption,
                selectedPeriod === "month" && [styles.activePeriod, { borderColor: theme.primary }],
              ]}
              onPress={() => handlePeriodSelect("month")}
            >
              <Text
                style={[styles.periodText, { color: selectedPeriod === "month" ? theme.primary : theme.textSecondary }]}
              >
                {t("stats.thisMonth")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodOption,
                selectedPeriod === "year" && [styles.activePeriod, { borderColor: theme.primary }],
              ]}
              onPress={() => handlePeriodSelect("year")}
            >
              <Text
                style={[styles.periodText, { color: selectedPeriod === "year" ? theme.primary : theme.textSecondary }]}
              >
                {t("stats.thisYear")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.periodOption,
                selectedPeriod === "custom" && [styles.activePeriod, { borderColor: theme.primary }],
              ]}
              onPress={() => handlePeriodSelect("custom")}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: selectedPeriod === "custom" ? theme.primary : theme.textSecondary },
                ]}
              >
                {t("stats.customRange")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Month Selector */}
        <MonthSelector
          selectedDate={selectedDate}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
        />

        {/* Tab Selector */}
        <View style={[styles.tabSelector, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "summary" && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab("summary")}
          >
            <Text style={[styles.tabText, { color: activeTab === "summary" ? theme.primary : theme.textSecondary }]}>
              {t("stats.summary")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "daily" && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab("daily")}
          >
            <Text style={[styles.tabText, { color: activeTab === "daily" ? theme.primary : theme.textSecondary }]}>
              {t("stats.daily")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary Tab Content */}
        {activeTab === "summary" && (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <StatsSummaryCard
                title={t("stats.totalDays")}
                value={monthStats?.stats.totalDays || 0}
                icon="calendar-outline"
                color={theme.primary}
                theme={theme}
              />

              <StatsSummaryCard
                title={t("stats.totalHours")}
                value={`${monthStats?.stats.totalHours || 0}h`}
                icon="time-outline"
                color={theme.success}
                theme={theme}
              />

              <StatsSummaryCard
                title={t("stats.averageDaily")}
                value={`${monthStats?.stats.averageHours || 0}h`}
                icon="analytics-outline"
                color={theme.info}
                theme={theme}
              />
            </View>

            {/* Status Distribution Chart */}
            <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>{t("stats.statusDistribution")}</Text>

              <StatusPieChart data={prepareChartData()} theme={theme} />

              {/* Legend */}
              <View style={styles.legend}>
                <Text style={[styles.legendTitle, { color: theme.text }]}>{t("stats.legend")}</Text>

                <View style={styles.legendItems}>
                  {prepareChartData().map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                        {item.name} ({item.value})
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </>
        )}

        {/* Daily Tab Content */}
        {activeTab === "daily" && (
          <>
            {/* Daily Hours Chart */}
            <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>{t("stats.dailyHours")}</Text>

              <DailyHoursChart month={formatMonthForApi()} dailyWorkStatus={dailyWorkStatus} theme={theme} />
            </View>

            {/* Daily Status List */}
            <View style={[styles.chartCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.chartTitle, { color: theme.text }]}>{t("stats.dailyStatus")}</Text>

              <DailyStatusList
                month={formatMonthForApi()}
                dailyWorkStatus={dailyWorkStatus}
                getStatusColor={getStatusColor}
                theme={theme}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportIcon: {
    marginRight: 4,
  },
  exportText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  periodSelector: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  periodOptions: {
    padding: 8,
  },
  periodOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "transparent",
    marginRight: 8,
  },
  activePeriod: {
    borderWidth: 1,
  },
  periodText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabSelector: {
    flexDirection: "row",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  legend: {
    marginTop: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
})

export default StatisticsScreen
