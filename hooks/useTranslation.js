"use client"

import { useContext } from "react"
import { LanguageContext } from "../contexts"
import vi from "../localization/vi"

export const useTranslation = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    console.error("useTranslation must be used within a LanguageProvider")
    // Return default values to prevent app crashes
    return {
      language: "vi",
      translations: vi,
      changeLanguage: () => {},
      t: (key) => key,
    }
  }

  return context
}
