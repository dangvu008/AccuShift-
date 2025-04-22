import { View, ActivityIndicator, Text, StyleSheet } from "react-native"
import { useTheme } from "../hooks"
import { useState, useEffect } from "react"

const LoadingIndicator = ({ message = "Loading..." }) => {
  // Try to use theme if available, otherwise use default colors
  const themeHook = useTheme()
  const [theme, setTheme] = useState({
    background: "#F2F2F7",
    text: "#000000",
  })

  useEffect(() => {
    try {
      setTheme({
        background: themeHook.isDarkMode ? "#121826" : "#F2F2F7",
        text: themeHook.isDarkMode ? "#FFFFFF" : "#000000",
      })
    } catch (e) {
      // Fallback colors if theme context isn't available yet
      setTheme({
        background: "#F2F2F7",
        text: "#000000",
      })
    }
  }, [themeHook.isDarkMode])

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large" color="#4A6FFF" />
      <Text style={[styles.text, { color: theme.text }]}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
})

export default LoadingIndicator
