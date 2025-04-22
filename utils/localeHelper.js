// Import các locale từ date-fns
import { vi, enUS } from "date-fns/locale"

/**
 * Lấy locale dựa trên ngôn ngữ
 * @param {string} language - Ngôn ngữ (vi hoặc en)
 * @returns {Locale} - Đối tượng locale của date-fns
 */
export const getLocale = (language) => {
  return language === "vi" ? vi : enUS
}

/**
 * Lấy tất cả các locale được hỗ trợ
 * @returns {Object} - Đối tượng chứa tất cả các locale
 */
export const getAllLocales = () => {
  return { vi, enUS }
}

export default {
  getLocale,
  getAllLocales,
}
