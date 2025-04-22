import { createContext, useState, useEffect } from "react"
import { AlarmService } from "../services"

// Tạo context
export const AlarmContext = createContext({
  alarms: [],
  isLoading: true,
  addAlarm: async () => {},
  updateAlarm: async () => {},
  deleteAlarm: async () => {},
  toggleAlarm: async () => {},
  snoozeAlarm: async () => {},
  rescheduleAllAlarms: async () => {},
  alarmSettings: {
    soundEnabled: true,
    vibrationEnabled: true,
    soundName: "default",
    snoozeMinutes: 5,
  },
  updateAlarmSettings: async () => {},
})

export const AlarmProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [alarmSettings, setAlarmSettings] = useState({
    soundEnabled: true,
    vibrationEnabled: true,
    soundName: "default",
    snoozeMinutes: 5,
  })

  // Initialize alarm service and load alarms
  useEffect(() => {
    const initAlarms = async () => {
      try {
        setIsLoading(true)

        // Initialize alarm service
        await AlarmService.initAlarmService()

        // Load alarms
        const savedAlarms = await AlarmService.getAlarms()
        setAlarms(savedAlarms)

        // Load alarm settings
        const savedSettings = await AlarmService.getAlarmSettings()
        setAlarmSettings(savedSettings)
      } catch (error) {
        console.error("Error initializing alarms:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initAlarms()
  }, [])

  // Add a new alarm
  const addAlarm = async (alarmData) => {
    try {
      const newAlarm = await AlarmService.addAlarm(alarmData)
      setAlarms((prevAlarms) => [...prevAlarms, newAlarm])
      return newAlarm
    } catch (error) {
      console.error("Error adding alarm:", error)
      throw error
    }
  }

  // Update an existing alarm
  const updateAlarm = async (alarmId, alarmData) => {
    try {
      const updatedAlarm = await AlarmService.updateAlarm(alarmId, alarmData)
      setAlarms((prevAlarms) => prevAlarms.map((alarm) => (alarm.id === alarmId ? updatedAlarm : alarm)))
      return updatedAlarm
    } catch (error) {
      console.error("Error updating alarm:", error)
      throw error
    }
  }

  // Delete an alarm
  const deleteAlarm = async (alarmId) => {
    try {
      await AlarmService.deleteAlarm(alarmId)
      setAlarms((prevAlarms) => prevAlarms.filter((alarm) => alarm.id !== alarmId))
      return true
    } catch (error) {
      console.error("Error deleting alarm:", error)
      throw error
    }
  }

  // Toggle alarm enabled state
  const toggleAlarm = async (alarmId, isEnabled) => {
    try {
      const updatedAlarm = await AlarmService.toggleAlarm(alarmId, isEnabled)
      setAlarms((prevAlarms) => prevAlarms.map((alarm) => (alarm.id === alarmId ? updatedAlarm : alarm)))
      return updatedAlarm
    } catch (error) {
      console.error("Error toggling alarm:", error)
      throw error
    }
  }

  // Snooze an alarm
  const snoozeAlarm = async (alarmId, minutes = 5) => {
    try {
      return await AlarmService.snoozeAlarm(alarmId, minutes)
    } catch (error) {
      console.error("Error snoozing alarm:", error)
      throw error
    }
  }

  // Reschedule all alarms
  const rescheduleAllAlarms = async () => {
    try {
      return await AlarmService.rescheduleAllAlarms()
    } catch (error) {
      console.error("Error rescheduling alarms:", error)
      throw error
    }
  }

  // Update alarm settings
  const updateAlarmSettings = async (newSettings) => {
    try {
      const updatedSettings = await AlarmService.updateAlarmSettings(newSettings)
      setAlarmSettings(updatedSettings)
      return updatedSettings
    } catch (error) {
      console.error("Error updating alarm settings:", error)
      throw error
    }
  }

  return (
    <AlarmContext.Provider
      value={{
        alarms,
        isLoading,
        addAlarm,
        updateAlarm,
        deleteAlarm,
        toggleAlarm,
        snoozeAlarm,
        rescheduleAllAlarms,
        alarmSettings,
        updateAlarmSettings,
      }}
    >
      {children}
    </AlarmContext.Provider>
  )
}

export default AlarmProvider
