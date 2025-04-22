"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Import from index files
import { useTheme, useTranslation, useWork, useNotification, useWeather } from "../hooks"
import { SettingsScreenSkeleton } from "../components"

const SettingsScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme()
  const { language, changeLanguage, t } = useTranslation()
  const { shifts, applyShift, deleteShift, settings, updateSettings, isLoading: workIsLoading } = useWork()
  const { notificationSettings, updateNotificationSettings } = useNotification()
  const { weatherSettings, saveWeatherSettings, isLoading: weatherIsLoading } = useWeather()

  const [visibleShifts, setVisibleShifts] = useState([])
  const [hourFormat, setHourFormat] = useState("24h")
  const [weekStartDay, setWeekStartDay] = useState("monday")
  const [shiftReminder, setShiftReminder] = useState("ask_weekly")
  const [weatherApiModalVisible, setWeatherApiModalVisible] = useState(false)
  const [weatherApiKey, setWeatherApiKey] = useState("")
  const [isPaidApiActive, setIsPaidApiActive] = useState(false)

  // Check if any data is still loading
  const isLoading = workIsLoading || weatherIsLoading

  // Function to check if paid API is enabled
  const isPaidApiEnabled = async () => {
    try {
      const apiKey = await AsyncStorage.getItem("@weather_api_key")
      return !!apiKey // Returns true if apiKey exists, false otherwise
    } catch (error) {
      console.error("Error checking weather API key:", error)
      return false
    }
  }

  // Function to set the paid API key
  const setPaidApiKey = async (apiKey) => {
    try {
      await AsyncStorage.setItem("@weather_api_key", apiKey)
    } catch (error) {
      console.error("Error saving weather API key:", error)
      throw error // Re-throw the error for the caller to handle
    }
  }

  // Function to remove the paid API key
  const removePaidApiKey = async () => {
    try {
      await AsyncStorage.removeItem("@weather_api_key")
    } catch (error) {
      console.error("Error removing weather API key:", error)
      throw error // Re-throw the error for the caller to handle
    }
  }

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      // Load hour format
      try {
        const savedHourFormat = await AsyncStorage.getItem("@hour_format")
        if (savedHourFormat) {
          setHourFormat(savedHourFormat)
        }
      } catch (error) {
        console.error("Error loading hour format:", error)
      }

      // Load week start day
      try {
        const savedWeekStartDay = await AsyncStorage.getItem("@week_start_day")
        if (savedWeekStartDay) {
          setWeekStartDay(savedWeekStartDay)
        }
      } catch (error) {
        console.error("Error loading week start day:", error)
      }

      // Load shift reminder setting
      try {
        const savedShiftReminder = await AsyncStorage.getItem("@shift_reminder")
        if (savedShiftReminder) {
          setShiftReminder(savedShiftReminder)
        }
      } catch (error) {
        console.error("Error loading shift reminder setting:", error)
      }

      // Check if paid API is enabled
      try {
        const paidApiEnabled = await isPaidApiEnabled()
        setIsPaidApiActive(paidApiEnabled)
      } catch (error) {
        console.error("Error checking paid API status:", error)
      }
    }

    loadSettings()
  }, [])

  // Update visible shifts when shifts change
  useEffect(() => {
    // Show up to 3 shifts, prioritizing the applied one
    const appliedShift = shifts.find((shift) => shift.isApplied)
    let shiftsToShow = []

    if (appliedShift) {
      shiftsToShow.push(appliedShift)

      // Add other shifts (not the applied one) until we have 3 shifts
      const otherShifts = shifts.filter((shift) => !shift.isApplied)
      shiftsToShow = [...shiftsToShow, ...otherShifts.slice(0, 2)]
    } else {
      shiftsToShow = shifts.slice(0, 3)
    }

    setVisibleShifts(shiftsToShow)
  }, [shifts])

  // Save hour format
  const handleHourFormatChange = async (value) => {
    setHourFormat(value)
    try {
      await AsyncStorage.setItem("@hour_format", value)
    } catch (error) {
      console.error("Error saving hour format:", error)
    }
  }

  // Save week start day
  const handleWeekStartDayChange = async (value) => {
    setWeekStartDay(value)
    try {
      await AsyncStorage.setItem("@week_start_day", value)
    } catch (error) {
      console.error("Error saving week start day:", error)
    }
  }

  // Save shift reminder setting
  const handleShiftReminderChange = async (value) => {
    setShiftReminder(value)
    try {
      await AsyncStorage.setItem("@shift_reminder", value)
    } catch (error) {
      console.error("Error saving shift reminder setting:", error)
    }
  }

  // Handle applying a shift
  const handleApplyShift = (shiftId) => {
    Alert.alert(t("settings.applyShiftTitle"), t("settings.applyShiftMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.confirm"),
        onPress: () => {
          applyShift(shiftId)
        },
      },
    ])
  }

  // Handle deleting a shift
  const handleDeleteShift = (shiftId) => {
    Alert.alert(t("settings.deleteShiftTitle"), t("settings.deleteShiftMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          deleteShift(shiftId)
        },
      },
    ])
  }

  // Handle language change
  const handleLanguageChange = () => {
    const newLanguage = language === "vi" ? "en" : "vi"
    changeLanguage(newLanguage)
  }

  // Handle simple button mode change
  const handleSimpleButtonModeChange = (value) => {
    updateSettings({ simpleButtonMode: value })
  }

  // Handle weather location settings
  const handleWeatherLocationSettings = () => {
    navigation.navigate("WeatherSettings")
  }

  // Handle sound settings
  const handleSoundSettings = () => {
    navigation.navigate("SoundSettings")
  }

  // Handle setting paid API key
  const handleSetApiKey = async () => {
    if (!weatherApiKey.trim()) {
      Alert.alert(t("settings.error"), t("settings.weatherApiKeyEmpty"))
      return
    }

    try {
      await setPaidApiKey(weatherApiKey)
      setIsPaidApiActive(true)
      setWeatherApiKey("")
      Alert.alert(t("settings.success"), t("settings.weatherApiKeySet"))
    } catch (error) {
      console.error("Error setting weather API key:", error)
      Alert.alert(t("settings.error"), t("settings.weatherApiKeyError"))
    }
  }

  // Handle removing paid API key
  const handleRemoveApiKey = async () => {
    Alert.alert(t("settings.removeWeatherApiKeyTitle"), t("settings.removeWeatherApiKeyMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.confirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await removePaidApiKey()
            setIsPaidApiActive(false)
            Alert.alert(t("settings.success"), t("settings.weatherApiKeyRemoved"))
          } catch (error) {
            console.error("Error removing weather API key:", error)
            Alert.alert(t("settings.error"), t("settings.weatherApiKeyRemoveError"))
          }
        },
      },
    ])
  }

  // Handle backup and restore
  const handleBackupRestore = () => {
    navigation.navigate("BackupRestore")
  }

  // Handle statistics
  const handleStatistics = () => {
    navigation.navigate("Stats")
  }

  // Get app version
  const getAppVersion = () => {
    // In a real app, you would get this from app.json or a config file
    return "1.0.0"
  }

  // Thêm hàm xử lý tạo dữ liệu mẫu vào component SettingsScreen
  const handleSampleData = () => {
    navigation.navigate("SampleData")
  }

  // Theme colors
  const themeUpdated = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
  }

  // If data is still loading, show skeleton screen
  if (isLoading) {
    return <SettingsScreenSkeleton />
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeUpdated.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* General Settings Section */}
        <View style={[styles.section, { backgroundColor: themeUpdated.card }]}>
          <Text style={[styles.sectionTitle, { color: themeUpdated.text }]}>Cài đặt chung</Text>

          {/* Dark Mode */}
          <TouchableOpacity style={styles.settingItem} onPress={toggleTheme}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeUpdated.text }]}>Chế độ tối</Text>
            </View>
            <View style={[styles.toggle, { backgroundColor: isDarkMode ? themeUpdated.primary : "#E9E9EA" }]}>
              <View
                style={[
                  styles.toggleCircle,
                  {
                    backgroundColor: "#FFFFFF",
                    transform: [{ translateX: isDarkMode ? 20 : 0 }],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Simple Button Mode */}
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSimpleButtonModeChange(!settings.simpleButtonMode)}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeUpdated.text }]}>Chỉ Đi Làm</Text>
              <Text style={[styles.settingDescription, { color: themeUpdated.textSecondary }]}>
                Chỉ hiển thị nút "Đi Làm" thay vì nhiều bước
              </Text>
            </View>
            <View
              style={[styles.toggle, { backgroundColor: settings.simpleButtonMode ? themeUpdated.primary : "#E9E9EA" }]}
            >
              <View
                style={[
                  styles.toggleCircle,
                  {
                    backgroundColor: "#FFFFFF",
                    transform: [{ translateX: settings.simpleButtonMode ? 20 : 0 }],
                  },
                ]}
              />
            </View>
          </TouchableOpacity>

          {/* Language */}
          <TouchableOpacity style={styles.settingItem} onPress={handleLanguageChange}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeUpdated.text }]}>Ngôn ngữ</Text>
            </View>
            <View style={styles.languageButton}>
              <Text style={[styles.languageText, { color: themeUpdated.primary }]}>
                {language === "vi" ? "🇻🇳 Tiếng Việt" : "🇬🇧 English"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={themeUpdated.primary} />
            </View>
          </TouchableOpacity>

          {/* Sample Data */}
          <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate("SampleData")}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeUpdated.text }]}>Dữ liệu mẫu</Text>
              <Text style={[styles.settingDescription, { color: themeUpdated.textSecondary }]}>
                Tạo dữ liệu mẫu để kiểm tra ứng dụng
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeUpdated.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* App Information */}
        <View style={[styles.section, { backgroundColor: themeUpdated.card }]}>
          <Text style={[styles.sectionTitle, { color: themeUpdated.text }]}>Thông tin ứng dụng</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeUpdated.text }]}>Phiên bản</Text>
            </View>
            <Text style={[styles.versionText, { color: themeUpdated.textSecondary }]}>1.0.0</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: themeUpdated.text }]}>Liên hệ</Text>
              <Text style={[styles.settingDescription, { color: themeUpdated.textSecondary }]}>support@workly.app</Text>
            </View>
          </View>
        </View>
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
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 5,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageText: {
    fontSize: 16,
    marginRight: 4,
  },
  versionText: {
    fontSize: 16,
  },
})

export default SettingsScreen
