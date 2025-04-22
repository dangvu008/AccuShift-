import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { Platform } from "react-native"
import { format, addMinutes } from "date-fns"
import { SoundService } from "./SoundService"

// Storage keys
const STORAGE_KEYS = {
  ALARMS: "alarms",
  ALARM_SETTINGS: "alarm_settings",
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => {
    // Get sound URI
    const soundUri = await SoundService.getSoundFileUri()

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      sound: soundUri,
    }
  },
})

/**
 * Initialize alarm service
 */
export const initAlarmService = async () => {
  try {
    // Request notification permissions
    await registerForPushNotificationsAsync()

    // Set up notification listeners
    setupNotificationListeners()

    return true
  } catch (error) {
    console.error("Error initializing alarm service:", error)
    return false
  }
}

/**
 * Register for push notifications
 */
async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("alarms", {
      name: "Alarms",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
      sound: true,
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!")
      return
    }

    token = (await Notifications.getExpoPushTokenAsync()).data
  } else {
    console.log("Must use physical device for Push Notifications")
  }

  return token
}

/**
 * Set up notification listeners
 */
const setupNotificationListeners = () => {
  // When a notification is received while the app is in the foreground
  const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
    console.log("Notification received:", notification)
  })

  // When a user taps on a notification
  const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log("Notification response received:", response)

    // Handle the notification response
    handleNotificationResponse(response)
  })

  return () => {
    Notifications.removeNotificationSubscription(notificationListener)
    Notifications.removeNotificationSubscription(responseListener)
  }
}

/**
 * Handle notification response
 */
const handleNotificationResponse = (response) => {
  const { notification } = response
  const data = notification.request.content.data

  // Handle different types of alarms
  switch (data.type) {
    case "departure":
    case "check_in":
    case "check_out":
      // Log the action in attendance logs
      logAttendanceAction(data.type, data.shiftId)
      break
    case "note":
      // Mark note as seen
      markNoteAsSeen(data.noteId)
      break
  }
}

/**
 * Log attendance action
 */
const logAttendanceAction = async (actionType, shiftId) => {
  try {
    // Get current time
    const now = new Date()
    const timeString = format(now, "HH:mm")

    // Create log entry
    const logEntry = {
      type: actionType,
      time: timeString,
      timestamp: now.toISOString(),
      shiftId,
      automatic: true,
    }

    // Get existing logs
    const logsData = await AsyncStorage.getItem("attendance_logs")
    const logs = logsData ? JSON.parse(logsData) : []

    // Add new log
    logs.push(logEntry)

    // Save updated logs
    await AsyncStorage.setItem("attendance_logs", JSON.stringify(logs))

    return true
  } catch (error) {
    console.error("Error logging attendance action:", error)
    return false
  }
}

/**
 * Mark note as seen
 */
const markNoteAsSeen = async (noteId) => {
  try {
    // Get notes
    const notesData = await AsyncStorage.getItem("notes")
    if (!notesData) return false

    const notes = JSON.parse(notesData)
    const noteIndex = notes.findIndex((note) => note.id === noteId)

    if (noteIndex >= 0) {
      // Update note
      notes[noteIndex] = {
        ...notes[noteIndex],
        lastSeen: new Date().toISOString(),
      }

      // Save updated notes
      await AsyncStorage.setItem("notes", JSON.stringify(notes))
      return true
    }

    return false
  } catch (error) {
    console.error("Error marking note as seen:", error)
    return false
  }
}

/**
 * Schedule an alarm
 */
export const scheduleAlarm = async (alarm) => {
  try {
    // Parse time
    const [hours, minutes] = alarm.time.split(":").map(Number)

    // Create trigger date
    let triggerDate

    if (alarm.type === "one_time") {
      // One-time alarm
      triggerDate = new Date(alarm.date)
      triggerDate.setHours(hours, minutes, 0, 0)
    } else if (alarm.type === "recurring") {
      // Recurring alarm - schedule for next occurrence
      triggerDate = getNextOccurrence(hours, minutes, alarm.days)
    } else if (alarm.type === "shift_linked") {
      // Shift-linked alarm - handled separately
      return scheduleShiftAlarm(alarm)
    }

    // Check if trigger date is in the past
    if (triggerDate < new Date()) {
      console.log("Alarm date is in the past, not scheduling:", alarm.title)
      return false
    }

    // Schedule notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: alarm.title,
        body: alarm.description || "",
        sound: true,
        priority: "high",
        data: {
          type: alarm.type,
          alarmId: alarm.id,
          ...alarm,
        },
      },
      trigger: triggerDate,
      identifier: `alarm_${alarm.id}`,
    })

    console.log("Scheduled alarm:", notificationId)
    return true
  } catch (error) {
    console.error("Error scheduling alarm:", error)
    return false
  }
}

/**
 * Schedule a shift-linked alarm
 */
const scheduleShiftAlarm = async (alarm) => {
  try {
    // Get active shift
    const activeShiftId = await AsyncStorage.getItem("activeShiftId")
    if (!activeShiftId) return false

    const shiftsData = await AsyncStorage.getItem("shifts")
    if (!shiftsData) return false

    const shifts = JSON.parse(shiftsData)
    const activeShift = shifts.find((shift) => shift.id === activeShiftId)

    if (!activeShift) return false

    // Get today's day of week (1-7, where 1 is Monday and 7 is Sunday)
    const today = new Date().getDay()
    const dayIndex = today === 0 ? 7 : today

    // Check if today is a working day for this shift
    if (!activeShift.appliedDays.includes(dayIndex)) {
      return false
    }

    // Schedule alarms based on shift times
    const alarms = []

    // Departure alarm
    if (alarm.includeDeparture) {
      const [hours, minutes] = activeShift.departureTime.split(":").map(Number)
      const departureDate = new Date()
      departureDate.setHours(hours, minutes, 0, 0)

      // If departure time is in the past, don't schedule
      if (departureDate > new Date()) {
        const departureId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to Leave for Work",
            body: `Your shift (${activeShift.name}) starts at ${activeShift.startTime}`,
            sound: true,
            priority: "high",
            data: {
              type: "departure",
              alarmId: `${alarm.id}_departure`,
              shiftId: activeShift.id,
              shiftName: activeShift.name,
              time: activeShift.departureTime,
            },
          },
          trigger: departureDate,
          identifier: `alarm_${alarm.id}_departure`,
        })

        alarms.push(departureId)
      }
    }

    // Check-in alarm
    if (alarm.includeCheckIn) {
      const [hours, minutes] = activeShift.startTime.split(":").map(Number)
      const checkInDate = new Date()
      checkInDate.setHours(hours, minutes, 0, 0)

      // If check-in time is in the past, don't schedule
      if (checkInDate > new Date()) {
        const checkInId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to Check In",
            body: `Your shift (${activeShift.name}) has started`,
            sound: true,
            priority: "high",
            data: {
              type: "check_in",
              alarmId: `${alarm.id}_check_in`,
              shiftId: activeShift.id,
              shiftName: activeShift.name,
              time: activeShift.startTime,
            },
          },
          trigger: checkInDate,
          identifier: `alarm_${alarm.id}_check_in`,
        })

        alarms.push(checkInId)
      }
    }

    // Check-out alarm
    if (alarm.includeCheckOut) {
      const [hours, minutes] = activeShift.endTime.split(":").map(Number)
      const checkOutDate = new Date()
      checkOutDate.setHours(hours, minutes, 0, 0)

      // Handle night shifts where end time is on the next day
      if (hours < activeShift.startTime.split(":")[0]) {
        checkOutDate.setDate(checkOutDate.getDate() + 1)
      }

      // If check-out time is in the past, don't schedule
      if (checkOutDate > new Date()) {
        const checkOutId = await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to Check Out",
            body: `Your shift (${activeShift.name}) has ended`,
            sound: true,
            priority: "high",
            data: {
              type: "check_out",
              alarmId: `${alarm.id}_check_out`,
              shiftId: activeShift.id,
              shiftName: activeShift.name,
              time: activeShift.endTime,
            },
          },
          trigger: checkOutDate,
          identifier: `alarm_${alarm.id}_check_out`,
        })

        alarms.push(checkOutId)
      }
    }

    return alarms.length > 0
  } catch (error) {
    console.error("Error scheduling shift alarm:", error)
    return false
  }
}

/**
 * Get next occurrence of a recurring alarm
 */
const getNextOccurrence = (hours, minutes, days) => {
  const now = new Date()
  const currentDay = now.getDay() // 0 = Sunday, 1 = Monday, ...

  // Convert days to match JavaScript's day format (0-6)
  const convertedDays = days.map((day) => {
    if (day === 7) return 0 // Convert Sunday from 7 to 0
    return day
  })

  // Sort days to find the next occurrence
  const sortedDays = [...convertedDays].sort((a, b) => {
    const diffA = (a - currentDay + 7) % 7
    const diffB = (b - currentDay + 7) % 7
    return diffA - diffB
  })

  // Find the next day
  let nextDay = sortedDays.find((day) => {
    if (day === currentDay) {
      // If it's the same day, check if the time has passed
      const alarmTime = new Date()
      alarmTime.setHours(hours, minutes, 0, 0)
      return alarmTime > now
    }
    return (day - currentDay + 7) % 7 > 0
  })

  // If no next day found, use the first day (next week)
  if (nextDay === undefined) {
    nextDay = sortedDays[0]
  }

  // Calculate days to add
  let daysToAdd = (nextDay - currentDay + 7) % 7
  if (daysToAdd === 0) {
    // If it's the same day but time has passed, schedule for next week
    const alarmTime = new Date()
    alarmTime.setHours(hours, minutes, 0, 0)
    if (alarmTime <= now) {
      daysToAdd = 7
    }
  }

  // Create trigger date
  const triggerDate = new Date()
  triggerDate.setDate(triggerDate.getDate() + daysToAdd)
  triggerDate.setHours(hours, minutes, 0, 0)

  return triggerDate
}

/**
 * Cancel an alarm
 */
export const cancelAlarm = async (alarmId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(`alarm_${alarmId}`)

    // Also cancel any related alarms for shift-linked alarms
    await Notifications.cancelScheduledNotificationAsync(`alarm_${alarmId}_departure`)
    await Notifications.cancelScheduledNotificationAsync(`alarm_${alarmId}_check_in`)
    await Notifications.cancelScheduledNotificationAsync(`alarm_${alarmId}_check_out`)

    return true
  } catch (error) {
    console.error("Error canceling alarm:", error)
    return false
  }
}

/**
 * Snooze an alarm
 */
export const snoozeAlarm = async (alarmId, minutes = 5) => {
  try {
    // Get alarm details
    const alarmsData = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS)
    if (!alarmsData) return false

    const alarms = JSON.parse(alarmsData)
    const alarm = alarms.find((a) => a.id === alarmId)

    if (!alarm) return false

    // Calculate snooze time
    const snoozeTime = addMinutes(new Date(), minutes)

    // Schedule snooze notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${alarm.title} (Snoozed)`,
        body: alarm.description || "",
        sound: true,
        priority: "high",
        data: {
          type: alarm.type,
          alarmId: alarm.id,
          isSnooze: true,
          ...alarm,
        },
      },
      trigger: snoozeTime,
      identifier: `alarm_${alarmId}_snooze`,
    })

    return true
  } catch (error) {
    console.error("Error snoozing alarm:", error)
    return false
  }
}

/**
 * Get all alarms
 */
export const getAlarms = async () => {
  try {
    const alarmsData = await AsyncStorage.getItem(STORAGE_KEYS.ALARMS)
    return alarmsData ? JSON.parse(alarmsData) : []
  } catch (error) {
    console.error("Error getting alarms:", error)
    return []
  }
}

/**
 * Save alarms
 */
export const saveAlarms = async (alarms) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ALARMS, JSON.stringify(alarms))
    return true
  } catch (error) {
    console.error("Error saving alarms:", error)
    return false
  }
}

/**
 * Add a new alarm
 */
export const addAlarm = async (alarmData) => {
  try {
    // Get existing alarms
    const alarms = await getAlarms()

    // Create new alarm
    const newAlarm = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isEnabled: true,
      ...alarmData,
    }

    // Add to alarms list
    const updatedAlarms = [...alarms, newAlarm]

    // Save updated alarms
    await saveAlarms(updatedAlarms)

    // Schedule the alarm if enabled
    if (newAlarm.isEnabled) {
      await scheduleAlarm(newAlarm)
    }

    return newAlarm
  } catch (error) {
    console.error("Error adding alarm:", error)
    throw error
  }
}

/**
 * Update an existing alarm
 */
export const updateAlarm = async (alarmId, alarmData) => {
  try {
    // Get existing alarms
    const alarms = await getAlarms()

    // Find alarm index
    const alarmIndex = alarms.findIndex((alarm) => alarm.id === alarmId)
    if (alarmIndex === -1) {
      throw new Error("Alarm not found")
    }

    // Cancel existing alarm
    await cancelAlarm(alarmId)

    // Update alarm
    const updatedAlarm = {
      ...alarms[alarmIndex],
      ...alarmData,
      updatedAt: new Date().toISOString(),
    }

    // Update alarms list
    const updatedAlarms = [...alarms]
    updatedAlarms[alarmIndex] = updatedAlarm

    // Save updated alarms
    await saveAlarms(updatedAlarms)

    // Schedule the alarm if enabled
    if (updatedAlarm.isEnabled) {
      await scheduleAlarm(updatedAlarm)
    }

    return updatedAlarm
  } catch (error) {
    console.error("Error updating alarm:", error)
    throw error
  }
}

/**
 * Delete an alarm
 */
export const deleteAlarm = async (alarmId) => {
  try {
    // Get existing alarms
    const alarms = await getAlarms()

    // Filter out the alarm to delete
    const updatedAlarms = alarms.filter((alarm) => alarm.id !== alarmId)

    // Save updated alarms
    await saveAlarms(updatedAlarms)

    // Cancel the alarm
    await cancelAlarm(alarmId)

    return true
  } catch (error) {
    console.error("Error deleting alarm:", error)
    throw error
  }
}

/**
 * Toggle alarm enabled state
 */
export const toggleAlarm = async (alarmId, isEnabled) => {
  try {
    // Get existing alarms
    const alarms = await getAlarms()

    // Find alarm index
    const alarmIndex = alarms.findIndex((alarm) => alarm.id === alarmId)
    if (alarmIndex === -1) {
      throw new Error("Alarm not found")
    }

    // Update alarm
    const updatedAlarm = {
      ...alarms[alarmIndex],
      isEnabled,
      updatedAt: new Date().toISOString(),
    }

    // Update alarms list
    const updatedAlarms = [...alarms]
    updatedAlarms[alarmIndex] = updatedAlarm

    // Save updated alarms
    await saveAlarms(updatedAlarms)

    // Schedule or cancel the alarm
    if (isEnabled) {
      await scheduleAlarm(updatedAlarm)
    } else {
      await cancelAlarm(alarmId)
    }

    return updatedAlarm
  } catch (error) {
    console.error("Error toggling alarm:", error)
    throw error
  }
}

/**
 * Get alarm settings
 */
export const getAlarmSettings = async () => {
  try {
    const settingsData = await AsyncStorage.getItem(STORAGE_KEYS.ALARM_SETTINGS)
    return settingsData
      ? JSON.parse(settingsData)
      : {
          soundEnabled: true,
          vibrationEnabled: true,
          soundName: "default",
          snoozeMinutes: 5,
        }
  } catch (error) {
    console.error("Error getting alarm settings:", error)
    return {
      soundEnabled: true,
      vibrationEnabled: true,
      soundName: "default",
      snoozeMinutes: 5,
    }
  }
}

/**
 * Save alarm settings
 */
export const saveAlarmSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ALARM_SETTINGS, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error("Error saving alarm settings:", error)
    return false
  }
}

/**
 * Update alarm settings
 */
export const updateAlarmSettings = async (newSettings) => {
  try {
    const currentSettings = await getAlarmSettings()
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
    }

    await saveAlarmSettings(updatedSettings)
    return updatedSettings
  } catch (error) {
    console.error("Error updating alarm settings:", error)
    throw error
  }
}

/**
 * Reschedule all alarms
 */
export const rescheduleAllAlarms = async () => {
  try {
    // Cancel all existing alarms
    await Notifications.cancelAllScheduledNotificationsAsync()

    // Get all alarms
    const alarms = await getAlarms()

    // Schedule enabled alarms
    const enabledAlarms = alarms.filter((alarm) => alarm.isEnabled)

    for (const alarm of enabledAlarms) {
      await scheduleAlarm(alarm)
    }

    return true
  } catch (error) {
    console.error("Error rescheduling alarms:", error)
    return false
  }
}

export default {
  initAlarmService,
  scheduleAlarm,
  cancelAlarm,
  snoozeAlarm,
  getAlarms,
  saveAlarms,
  addAlarm,
  updateAlarm,
  deleteAlarm,
  toggleAlarm,
  getAlarmSettings,
  saveAlarmSettings,
  updateAlarmSettings,
  rescheduleAllAlarms,
}
