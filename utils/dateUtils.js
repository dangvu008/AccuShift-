import { format, addDays, subDays, startOfWeek } from "date-fns"

// Format ngày theo định dạng yyyy-MM-dd
export const formatDate = (date) => {
  return format(date, "yyyy-MM-dd")
}

// Format ngày theo ngôn ngữ
export const formatDateLocale = (date, language = "vi") => {
  // Trong Snack, không sử dụng locale
  return format(date, "EEEE, dd/MM/yyyy")
}

// Format thời gian theo định dạng HH:mm
export const formatTime = (date) => {
  return format(date, "HH:mm")
}

// Lấy các ngày trong tuần (từ thứ 2 đến chủ nhật)
export const getWeekDays = (date = new Date()) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Bắt đầu từ thứ 2

  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

// Lấy ngày trước đó
export const getPreviousDay = (date = new Date()) => {
  return subDays(date, 1)
}

// Lấy ngày tiếp theo
export const getNextDay = (date = new Date()) => {
  return addDays(date, 1)
}

// Lấy tên ngày trong tuần
export const getDayName = (date, language = "vi") => {
  // Trong Snack, không sử dụng locale
  return format(date, "EEEE")
}

// Lấy tên ngày trong tuần viết tắt
export const getDayShortName = (date, language = "vi") => {
  // Trong Snack, không sử dụng locale
  return format(date, "EEE")
}

// Lấy tên tháng
export const getMonthName = (date, language = "vi") => {
  // Trong Snack, không sử dụng locale
  return format(date, "MMMM")
}

// Lấy tên tháng viết tắt
export const getMonthShortName = (date, language = "vi") => {
  // Trong Snack, không sử dụng locale
  return format(date, "MMM")
}
