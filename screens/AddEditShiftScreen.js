"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useTheme, useTranslation, useWork } from "../hooks"
import { v4 as uuidv4 } from "uuid"

const AddEditShiftScreen = ({ route, navigation }) => {
  const { shift } = route.params || {}
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { addShift, updateShift, shifts } = useWork()
  const [isEditing, setIsEditing] = useState(!!shift)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [name, setName] = useState("")
  const [departureTime, setDepartureTime] = useState("07:30")
  const [startTime, setStartTime] = useState("08:00")
  const [officeEndTime, setOfficeEndTime] = useState("17:00")
  const [endTime, setEndTime] = useState("17:30")
  const [appliedDays, setAppliedDays] = useState([1, 2, 3, 4, 5]) // Default to weekdays
  const [reminderBefore, setReminderBefore] = useState("15")
  const [reminderAfter, setReminderAfter] = useState("15")
  const [showSignButton, setShowSignButton] = useState(true)

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [currentTimeField, setCurrentTimeField] = useState(null)

  // Validation errors
  const [errors, setErrors] = useState({})

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    inputBackground: isDarkMode ? "#2C3A59" : "#F0F0F5",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    error: "#FF3B30",
  }

  // Load shift data if editing
  useEffect(() => {
    if (shift) {
      setName(shift.name || "")
      setDepartureTime(shift.departureTime || "07:30")
      setStartTime(shift.startTime || "08:00")
      setOfficeEndTime(shift.officeEndTime || "17:00")
      setEndTime(shift.endTime || "17:30")
      setAppliedDays(shift.appliedDays || [1, 2, 3, 4, 5])
      setReminderBefore(shift.reminderBefore?.toString() || "15")
      setReminderAfter(shift.reminderAfter?.toString() || "15")
      setShowSignButton(shift.showSignButton !== false)
    }
  }, [shift])

  // Handle time picker change
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false)
    if (selectedTime && currentTimeField) {
      const hours = selectedTime.getHours().toString().padStart(2, "0")
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0")
      const timeString = `${hours}:${minutes}`

      switch (currentTimeField) {
        case "departureTime":
          setDepartureTime(timeString)
          validateDepartureTime(timeString, startTime)
          break
        case "startTime":
          setStartTime(timeString)
          validateStartTime(timeString, departureTime, officeEndTime)
          break
        case "officeEndTime":
          setOfficeEndTime(timeString)
          validateOfficeEndTime(timeString, startTime, endTime)
          break
        case "endTime":
          setEndTime(timeString)
          validateEndTime(timeString, officeEndTime)
          break
      }
    }
  }

  // Show time picker for a specific field
  const showTimePickerFor = (field) => {
    setCurrentTimeField(field)
    setShowTimePicker(true)
  }

  // Toggle day selection
  const toggleDay = (day) => {
    if (appliedDays.includes(day)) {
      const newDays = appliedDays.filter((d) => d !== day)
      setAppliedDays(newDays)
      validateAppliedDays(newDays)
    } else {
      const newDays = [...appliedDays, day].sort()
      setAppliedDays(newDays)
      validateAppliedDays(newDays)
    }
  }

  // Set preset days
  const setPresetDays = (preset) => {
    let newDays = []
    switch (preset) {
      case "weekdays":
        newDays = [1, 2, 3, 4, 5]
        break
      case "weekend":
        newDays = [6, 7]
        break
      case "all":
        newDays = [1, 2, 3, 4, 5, 6, 7]
        break
    }
    setAppliedDays(newDays)
    validateAppliedDays(newDays)
  }

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Calculate time difference in minutes, handling overnight shifts
  const getTimeDifference = (startTimeStr, endTimeStr) => {
    const startMinutes = timeToMinutes(startTimeStr)
    let endMinutes = timeToMinutes(endTimeStr)

    // If end time is earlier than start time, assume it's the next day
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60 // Add 24 hours in minutes
    }

    return endMinutes - startMinutes
  }

  // Validation functions
  const validateName = (value) => {
    let error = null

    if (!value.trim()) {
      error = "Tên ca không được để trống."
    } else if (value.length > 200) {
      error = "Tên ca quá dài (tối đa 200 ký tự)."
    } else {
      // Check for invalid characters using regex
      const validNameRegex = /^[\p{L}\p{N}\s]+$/u // Letters, numbers, and spaces from all languages
      if (!validNameRegex.test(value)) {
        error = "Tên ca chứa ký tự không hợp lệ."
      } else if (!isEditing) {
        // Check for duplicate names (case insensitive, ignoring extra spaces)
        const normalizedValue = value.trim().toLowerCase()
        const isDuplicate = shifts.some((s) => s.name.trim().toLowerCase() === normalizedValue)
        if (isDuplicate) {
          error = "Tên ca này đã tồn tại."
        }
      } else if (isEditing && shift) {
        // Check for duplicate names, excluding the current shift
        const normalizedValue = value.trim().toLowerCase()
        const isDuplicate = shifts.some((s) => s.id !== shift.id && s.name.trim().toLowerCase() === normalizedValue)
        if (isDuplicate) {
          error = "Tên ca này đã tồn tại."
        }
      }
    }

    setErrors((prev) => ({ ...prev, name: error }))
    return !error
  }

  const validateDepartureTime = (depTime, startTimeValue) => {
    let error = null

    // Departure time must be at least 5 minutes before start time
    const timeDiff = getTimeDifference(depTime, startTimeValue)
    if (timeDiff < 5) {
      error = "Giờ xuất phát phải trước giờ bắt đầu ít nhất 5 phút."
    }

    setErrors((prev) => ({ ...prev, departureTime: error }))
    return !error
  }

  const validateStartTime = (startTimeValue, depTime, officeEndTimeValue) => {
    const errors = {}

    // Validate against departure time
    const depTimeDiff = getTimeDifference(depTime, startTimeValue)
    if (depTimeDiff < 5) {
      errors.startTime = "Giờ bắt đầu phải sau giờ xuất phát ít nhất 5 phút."
    }

    // Validate against office end time
    const officeTimeDiff = getTimeDifference(startTimeValue, officeEndTimeValue)
    if (officeTimeDiff < 120) {
      // 2 hours = 120 minutes
      errors.startTime = "Thời gian làm việc HC tối thiểu phải là 2 giờ."
    }

    setErrors((prev) => ({ ...prev, ...errors }))
    return Object.keys(errors).length === 0
  }

  const validateOfficeEndTime = (officeEndTimeValue, startTimeValue, endTimeValue) => {
    const errors = {}

    // Validate against start time
    const startTimeDiff = getTimeDifference(startTimeValue, officeEndTimeValue)
    if (startTimeDiff < 120) {
      // 2 hours = 120 minutes
      errors.officeEndTime = "Thời gian làm việc HC tối thiểu phải là 2 giờ."
    }

    // Validate against end time
    const endTimeDiff = getTimeDifference(officeEndTimeValue, endTimeValue)
    if (endTimeDiff < 0) {
      errors.officeEndTime = "Giờ kết thúc HC phải trước hoặc bằng giờ kết thúc ca."
    }

    setErrors((prev) => ({ ...prev, ...errors }))
    return Object.keys(errors).length === 0
  }

  const validateEndTime = (endTimeValue, officeEndTimeValue) => {
    let error = null

    // End time must be equal to or after office end time
    const timeDiff = getTimeDifference(officeEndTimeValue, endTimeValue)

    if (timeDiff < 0) {
      error = "Giờ kết thúc ca phải sau hoặc bằng giờ kết thúc HC."
    } else if (timeDiff > 0 && timeDiff < 30) {
      error = "Nếu có OT, giờ kết thúc ca phải sau giờ kết thúc HC ít nhất 30 phút."
    }

    setErrors((prev) => ({ ...prev, endTime: error }))
    return !error
  }

  const validateAppliedDays = (days) => {
    let error = null

    if (!days || days.length === 0) {
      error = "Vui lòng chọn ít nhất một ngày áp dụng ca."
    }

    setErrors((prev) => ({ ...prev, appliedDays: error }))
    return !error
  }

  const validateReminderBefore = (value) => {
    let error = null

    if (!value.trim()) {
      error = "Thời gian nhắc nhở không được để trống."
    } else if (isNaN(Number(value)) || Number(value) < 0) {
      error = "Thời gian nhắc nhở phải là số dương."
    }

    setErrors((prev) => ({ ...prev, reminderBefore: error }))
    return !error
  }

  const validateReminderAfter = (value) => {
    let error = null

    if (!value.trim()) {
      error = "Thời gian nhắc nhở không được để trống."
    } else if (isNaN(Number(value)) || Number(value) < 0) {
      error = "Thời gian nhắc nhở phải là số dương."
    }

    setErrors((prev) => ({ ...prev, reminderAfter: error }))
    return !error
  }

  // Validate all fields
  const validateForm = () => {
    const nameValid = validateName(name)
    const departureTimeValid = validateDepartureTime(departureTime, startTime)
    const startTimeValid = validateStartTime(startTime, departureTime, officeEndTime)
    const officeEndTimeValid = validateOfficeEndTime(officeEndTime, startTime, endTime)
    const endTimeValid = validateEndTime(endTime, officeEndTime)
    const appliedDaysValid = validateAppliedDays(appliedDays)
    const reminderBeforeValid = validateReminderBefore(reminderBefore)
    const reminderAfterValid = validateReminderAfter(reminderAfter)

    return (
      nameValid &&
      departureTimeValid &&
      startTimeValid &&
      officeEndTimeValid &&
      endTimeValid &&
      appliedDaysValid &&
      reminderBeforeValid &&
      reminderAfterValid
    )
  }

  // Handle saving the shift
  const handleSave = () => {
    if (!validateForm()) {
      // Scroll to the first error
      return
    }

    Alert.alert(
      isEditing ? "Cập nhật ca làm việc" : "Thêm ca làm việc",
      "Bạn có chắc chắn muốn lưu thông tin ca làm việc này?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Lưu",
          onPress: async () => {
            setIsSaving(true)
            try {
              const shiftData = {
                name,
                departureTime,
                startTime,
                officeEndTime,
                endTime,
                appliedDays,
                reminderBefore: Number(reminderBefore),
                reminderAfter: Number(reminderAfter),
                showSignButton,
              }

              if (isEditing && shift) {
                await updateShift(shift.id, shiftData)
              } else {
                await addShift({
                  id: uuidv4(),
                  ...shiftData,
                  isApplied: false,
                })
              }

              navigation.goBack()
            } catch (error) {
              console.error("Error saving shift:", error)
              Alert.alert("Lỗi", "Không thể lưu ca làm việc. Vui lòng thử lại sau.")
            } finally {
              setIsSaving(false)
            }
          },
        },
      ],
    )
  }

  // Handle resetting the form
  const handleReset = () => {
    Alert.alert("Đặt lại form", "Bạn có chắc chắn muốn đặt lại tất cả thông tin đã nhập?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đặt lại",
        onPress: () => {
          if (isEditing && shift) {
            // Reset to original shift data
            setName(shift.name || "")
            setDepartureTime(shift.departureTime || "07:30")
            setStartTime(shift.startTime || "08:00")
            setOfficeEndTime(shift.officeEndTime || "17:00")
            setEndTime(shift.endTime || "17:30")
            setAppliedDays(shift.appliedDays || [1, 2, 3, 4, 5])
            setReminderBefore(shift.reminderBefore?.toString() || "15")
            setReminderAfter(shift.reminderAfter?.toString() || "15")
            setShowSignButton(shift.showSignButton !== false)
          } else {
            // Reset to default values
            setName("")
            setDepartureTime("07:30")
            setStartTime("08:00")
            setOfficeEndTime("17:00")
            setEndTime("17:30")
            setAppliedDays([1, 2, 3, 4, 5])
            setReminderBefore("15")
            setReminderAfter("15")
            setShowSignButton(true)
          }
          setErrors({})
        },
      },
    ])
  }

  // Get day name
  const getDayName = (day) => {
    const days = {
      1: "T2",
      2: "T3",
      3: "T4",
      4: "T5",
      5: "T6",
      6: "T7",
      7: "CN",
    }
    return days[day]
  }

  // Check if the form has any errors
  const hasErrors = () => {
    return Object.values(errors).some((error) => error !== null && error !== undefined)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isEditing ? "Chỉnh sửa ca làm việc" : "Thêm ca làm việc"}
          </Text>
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="refresh" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Shift Name */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Tên ca làm việc *</Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.name && styles.inputError,
              ]}
              placeholder="Nhập tên ca làm việc"
              placeholderTextColor={theme.textSecondary}
              value={name}
              onChangeText={(text) => {
                setName(text)
                validateName(text)
              }}
              maxLength={200}
            />
            {errors.name && <Text style={[styles.errorText, { color: theme.error }]}>{errors.name}</Text>}
          </View>

          {/* Time Inputs */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Giờ xuất phát *</Text>
            <TouchableOpacity
              style={[
                styles.timeInput,
                { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.departureTime && styles.inputError,
              ]}
              onPress={() => showTimePickerFor("departureTime")}
            >
              <Text style={[styles.timeText, { color: theme.text }]}>{departureTime}</Text>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            {errors.departureTime && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.departureTime}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Giờ bắt đầu *</Text>
            <TouchableOpacity
              style={[
                styles.timeInput,
                { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.startTime && styles.inputError,
              ]}
              onPress={() => showTimePickerFor("startTime")}
            >
              <Text style={[styles.timeText, { color: theme.text }]}>{startTime}</Text>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            {errors.startTime && <Text style={[styles.errorText, { color: theme.error }]}>{errors.startTime}</Text>}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Giờ kết thúc HC *</Text>
            <TouchableOpacity
              style={[
                styles.timeInput,
                { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.officeEndTime && styles.inputError,
              ]}
              onPress={() => showTimePickerFor("officeEndTime")}
            >
              <Text style={[styles.timeText, { color: theme.text }]}>{officeEndTime}</Text>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            {errors.officeEndTime && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.officeEndTime}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Giờ kết thúc ca *</Text>
            <TouchableOpacity
              style={[
                styles.timeInput,
                { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.endTime && styles.inputError,
              ]}
              onPress={() => showTimePickerFor("endTime")}
            >
              <Text style={[styles.timeText, { color: theme.text }]}>{endTime}</Text>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
            {errors.endTime && <Text style={[styles.errorText, { color: theme.error }]}>{errors.endTime}</Text>}
          </View>

          {/* Applied Days */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Ngày áp dụng *</Text>
            <View style={styles.daysContainer}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    appliedDays.includes(day) && { backgroundColor: theme.primary },
                    { borderColor: theme.border },
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[styles.dayText, { color: appliedDays.includes(day) ? "#FFFFFF" : theme.textSecondary }]}
                  >
                    {getDayName(day)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.appliedDays && <Text style={[styles.errorText, { color: theme.error }]}>{errors.appliedDays}</Text>}

            <View style={styles.presetButtons}>
              <TouchableOpacity
                style={[styles.presetButton, { borderColor: theme.border }]}
                onPress={() => setPresetDays("weekdays")}
              >
                <Text style={[styles.presetButtonText, { color: theme.textSecondary }]}>Ngày làm việc</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, { borderColor: theme.border }]}
                onPress={() => setPresetDays("weekend")}
              >
                <Text style={[styles.presetButtonText, { color: theme.textSecondary }]}>Cuối tuần</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, { borderColor: theme.border }]}
                onPress={() => setPresetDays("all")}
              >
                <Text style={[styles.presetButtonText, { color: theme.textSecondary }]}>Tất cả</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reminder Settings */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Nhắc nhở trước chấm công vào (phút) *</Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.reminderBefore && styles.inputError,
              ]}
              placeholder="Nhập số phút"
              placeholderTextColor={theme.textSecondary}
              value={reminderBefore}
              onChangeText={(text) => {
                setReminderBefore(text)
                validateReminderBefore(text)
              }}
              keyboardType="number-pad"
              maxLength={3}
            />
            {errors.reminderBefore && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.reminderBefore}</Text>
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: theme.text }]}>Nhắc nhở sau chấm công ra (phút) *</Text>
            <TextInput
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.inputBackground, borderColor: theme.border },
                errors.reminderAfter && styles.inputError,
              ]}
              placeholder="Nhập số phút"
              placeholderTextColor={theme.textSecondary}
              value={reminderAfter}
              onChangeText={(text) => {
                setReminderAfter(text)
                validateReminderAfter(text)
              }}
              keyboardType="number-pad"
              maxLength={3}
            />
            {errors.reminderAfter && (
              <Text style={[styles.errorText, { color: theme.error }]}>{errors.reminderAfter}</Text>
            )}
          </View>

          {/* Show Sign Button */}
          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <Text style={[styles.label, { color: theme.text }]}>Yêu cầu Ký công</Text>
              <Switch
                value={showSignButton}
                onValueChange={setShowSignButton}
                trackColor={{ false: "#767577", true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={[styles.helperText, { color: theme.textSecondary }]}>
              Hiển thị nút "Ký công" trong quá trình chấm công
            </Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: theme.primary },
              (hasErrors() || isSaving) && { opacity: 0.6 },
            ]}
            onPress={handleSave}
            disabled={hasErrors() || isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? "Đang lưu..." : isEditing ? "Cập nhật ca làm việc" : "Thêm ca làm việc"}
            </Text>
          </TouchableOpacity>

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Time Picker Modal */}
        {showTimePicker && (
          <DateTimePicker
            value={(() => {
              let timeStr = "00:00"
              switch (currentTimeField) {
                case "departureTime":
                  timeStr = departureTime
                  break
                case "startTime":
                  timeStr = startTime
                  break
                case "officeEndTime":
                  timeStr = officeEndTime
                  break
                case "endTime":
                  timeStr = endTime
                  break
              }
              const [hours, minutes] = timeStr.split(":").map(Number)
              const date = new Date()
              date.setHours(hours, minutes, 0, 0)
              return date
            })()}
            mode="time"
            is24Hour={true}
            display="spinner"
            onChange={handleTimeChange}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  resetButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  timeInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  presetButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  presetButton: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  presetButtonText: {
    fontSize: 12,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  bottomPadding: {
    height: 40,
  },
})

export default AddEditShiftScreen
