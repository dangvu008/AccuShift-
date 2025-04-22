"use client"
import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
  Platform,
  Animated,
  Dimensions,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Audio } from "expo-av"
import { useTheme, useTranslation } from "../hooks"
import { SoundService } from "../services"

const VIBRATION_PATTERN = [0, 500, 200, 500]
const SNOOZE_MINUTES = 5

const AlarmNotification = ({
  visible,
  onDismiss,
  onSnooze,
  title = "Alarm",
  message = "",
  type = "default",
  shiftName = "",
  time = "",
}) => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [sound, setSound] = useState(null)
  const [isVibrating, setIsVibrating] = useState(false)
  const fadeAnim = useState(new Animated.Value(0))[0]
  const scaleAnim = useState(new Animated.Value(0.9))[0]

  // Theme colors
  const theme = {
    background: isDarkMode ? "rgba(0, 0, 0, 0.9)" : "rgba(255, 255, 255, 0.9)",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    primary: "#4A6FFF",
    success: "#4CD964",
    warning: "#FF9500",
    error: "#FF3B30",
  }

  // Get color based on alarm type
  const getTypeColor = () => {
    switch (type) {
      case "departure":
        return theme.primary
      case "check_in":
        return theme.success
      case "check_out":
        return theme.warning
      case "note":
        return theme.primary
      default:
        return theme.primary
    }
  }

  // Get icon based on alarm type
  const getTypeIcon = () => {
    switch (type) {
      case "departure":
        return "walk-outline"
      case "check_in":
        return "log-in-outline"
      case "check_out":
        return "log-out-outline"
      case "note":
        return "document-text-outline"
      default:
        return "alarm-outline"
    }
  }

  // Play sound and start vibration when alarm is shown
  useEffect(() => {
    if (visible) {
      playSound()
      startVibration()

      // Start animations and effects
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      stopSound()
      stopVibration()
    }
  }, [visible, fadeAnim, scaleAnim, stopSound, stopVibration])

  // Play alarm sound
  const playSound = async () => {
    try {
      // Get sound URI from SoundService
      const soundUri = await SoundService.getSoundFileUri()

      if (soundUri) {
        const { sound: audioSound } = await Audio.Sound.createAsync(
          { uri: soundUri },
          { shouldPlay: true, isLooping: true, volume: 1.0 },
        )
        setSound(audioSound)
      } else {
        // Use default sound if no custom sound is set
        // In Snack, we can't use local sound files
        console.log("No custom sound set and can't use local sound files in Snack")
        // Just set a dummy sound object
        setSound({ stopAsync: async () => {}, unloadAsync: async () => {} })
      }
    } catch (error) {
      console.error("Error playing alarm sound:", error)
    }
  }

  // Stop alarm sound
  const stopSound = useCallback(async () => {
    if (sound) {
      await sound.stopAsync()
      await sound.unloadAsync()
      setSound(null)
    }
  }, [sound])

  // Start vibration
  const startVibration = () => {
    setIsVibrating(true)

    if (Platform.OS === "android") {
      // Android can use vibration patterns
      Vibration.vibrate(VIBRATION_PATTERN, true)
    } else {
      // iOS needs a simpler approach
      const interval = setInterval(() => {
        Vibration.vibrate()
      }, 1000)

      // Store interval ID for cleanup
      setIsVibrating(interval)
    }
  }

  // Stop vibration
  const stopVibration = useCallback(() => {
    if (Platform.OS === "android") {
      Vibration.cancel()
    } else if (isVibrating) {
      clearInterval(isVibrating)
    }
    setIsVibrating(false)
  }, [isVibrating])

  // Handle dismiss
  const handleDismiss = () => {
    stopSound()
    stopVibration()
    onDismiss && onDismiss()
  }

  // Handle snooze
  const handleSnooze = () => {
    stopSound()
    stopVibration()
    onSnooze && onSnooze(SNOOZE_MINUTES)
  }

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={handleDismiss}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Animated.View
          style={[
            styles.alarmCard,
            {
              backgroundColor: theme.card,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Alarm Header */}
          <View style={[styles.alarmHeader, { backgroundColor: getTypeColor() }]}>
            <Ionicons name={getTypeIcon()} size={32} color="#FFFFFF" />
            <Text style={styles.alarmTitle}>{title}</Text>
          </View>

          {/* Alarm Content */}
          <View style={styles.alarmContent}>
            {shiftName && (
              <View style={styles.infoRow}>
                <Ionicons name="briefcase-outline" size={20} color={theme.textSecondary} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: theme.text }]}>{shiftName}</Text>
              </View>
            )}

            {time && (
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={20} color={theme.textSecondary} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: theme.text }]}>{time}</Text>
              </View>
            )}

            {message && <Text style={[styles.alarmMessage, { color: theme.text }]}>{message}</Text>}

            <Text style={[styles.currentTime, { color: theme.textSecondary }]}>{new Date().toLocaleTimeString()}</Text>
          </View>

          {/* Alarm Actions */}
          <View style={styles.alarmActions}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.warning }]} onPress={handleSnooze}>
              <Ionicons name="time-outline" size={20} color="#FFFFFF" style={styles.actionIcon} />
              <Text style={styles.actionText}>{t("alarm.snooze", { minutes: SNOOZE_MINUTES })}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.success }]} onPress={handleDismiss}>
              <Ionicons name="checkmark-outline" size={20} color="#FFFFFF" style={styles.actionIcon} />
              <Text style={styles.actionText}>{t("alarm.dismiss")}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  )
}

const { width } = Dimensions.get("window")

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  alarmCard: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  alarmHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  alarmTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 12,
  },
  alarmContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
  },
  alarmMessage: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 24,
  },
  currentTime: {
    fontSize: 14,
    textAlign: "right",
    marginTop: 8,
  },
  alarmActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default AlarmNotification

