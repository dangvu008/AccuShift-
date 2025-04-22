import { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import vi from "../localization/vi"
import en from "../localization/en"

// Tạo context with default values
export const LanguageContext = createContext({
  language: "vi",
  translations: vi,
  changeLanguage: () => {},
  t: (key) => key,
  isLoading: true,
})

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("vi") // Mặc định là tiếng Việt
  const [translations, setTranslations] = useState(vi)
  const [isLoading, setIsLoading] = useState(true)

  // Tải ngôn ngữ từ AsyncStorage
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        setIsLoading(true)
        const savedLanguage = await AsyncStorage.getItem("@language")
        if (savedLanguage) {
          setLanguage(savedLanguage)
          setTranslations(savedLanguage === "vi" ? vi : en)
        }
      } catch (error) {
        console.error("Error loading language:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguage()
  }, [])

  // Thay đổi ngôn ngữ
  const changeLanguage = async (newLanguage) => {
    try {
      setLanguage(newLanguage)
      setTranslations(newLanguage === "vi" ? vi : en)
      await AsyncStorage.setItem("@language", newLanguage)
    } catch (error) {
      console.error("Error saving language:", error)
    }
  }

  // Hàm dịch
  const t = (key) => {
    // Tách key theo dấu chấm (ví dụ: "home.title" => ["home", "title"])
    const keys = key.split(".")

    // Tìm giá trị trong đối tượng translations
    let value = translations
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        // Nếu không tìm thấy, trả về key
        return key
      }
    }

    return value
  }

  return (
    <LanguageContext.Provider value={{ language, translations, changeLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}
