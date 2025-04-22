// Trong Snack, chúng ta không thể import trực tiếp từ date-fns/locale
// Tạo các đối tượng locale giả lập
const vi = {
  code: 'vi',
  formatDistance: () => '',
  formatRelative: () => '',
  localize: {
    month: () => '',
    day: () => '',
    dayPeriod: () => ''
  },
  match: {
    month: () => '',
    day: () => ''
  },
  options: {
    weekStartsOn: 1
  }
}

const enUS = {
  code: 'en-US',
  formatDistance: () => '',
  formatRelative: () => '',
  localize: {
    month: () => '',
    day: () => '',
    dayPeriod: () => ''
  },
  match: {
    month: () => '',
    day: () => ''
  },
  options: {
    weekStartsOn: 0
  }
}

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
