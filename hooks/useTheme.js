"use client"

import { useContext } from "react"
import { ThemeContext } from "../contexts"

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    console.error("useTheme must be used within a ThemeProvider")
    // Return default values to prevent app crashes
    return {
      isDarkMode: false,
      toggleTheme: () => {},
      theme: {
        dark: false,
        colors: {
          primary: "#4A6FFF",
          background: "#F2F2F7",
          card: "#FFFFFF",
          text: "#000000",
          border: "rgba(0, 0, 0, 0.05)",
          notification: "#FF3B30",
          textSecondary: "#8E8E93",
        },
      },
    }
  }

  return context
}
