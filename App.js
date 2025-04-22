"use client"

import { useEffect, useContext, useState } from "react"
import "react-native-gesture-handler"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Import screens from the index.js file
import { HomeScreen, SettingsScreen, NotesScreen, StatsScreen, SampleDataScreen } from "./screens"

// Import contexts from the index.js file
import {
  ThemeProvider,
  ThemeContext,
  LanguageProvider,
  WorkProvider,
  NotificationProvider,
  AlarmProvider,
  WeatherProvider,
  BackupProvider,
  LanguageContext, // Import LanguageContext
} from "./contexts"

// Import utils from the index.js file
import { shiftUtils } from "./utils"

// Update the imports to include SplashScreen and ErrorBoundary
import { SplashScreen, LoadingIndicator } from "./components"
import ErrorBoundary from "./components/ErrorBoundary"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Tạo các stack navigator riêng cho từng tab
const HomeStack = ({ theme, t }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: t("home.title"), headerShown: false }} />
    </Stack.Navigator>
  )
}

const SettingsStack = ({ theme, t }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: t("settings.title") }} />
      <Stack.Screen name="SampleData" component={SampleDataScreen} options={{ title: "Dữ liệu mẫu" }} />
    </Stack.Navigator>
  )
}

const NotesStack = ({ theme, t }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="NotesMain" component={NotesScreen} options={{ title: t("notes.title") }} />
    </Stack.Navigator>
  )
}

const StatsStack = ({ theme, t }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="StatsMain" component={StatsScreen} options={{ title: t("stats.title") }} />
    </Stack.Navigator>
  )
}

// Main App Component
export default function App() {
  const [isAppReady, setIsAppReady] = useState(false)

  useEffect(() => {
    // Initialize app data
    const initializeApp = async () => {
      try {
        // Simulate a minimum loading time for better UX
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setIsAppReady(true)
      } catch (error) {
        console.error("Error initializing app:", error)
        setIsAppReady(true) // Still set to true to avoid getting stuck
      }
    }

    initializeApp()
  }, [])

  if (!isAppReady) {
    return <AppLoadingScreen />
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <WorkProvider>
            <NotificationProvider>
              <AlarmProvider>
                <WeatherProvider>
                  <BackupProvider>
                    <AppContent />
                  </BackupProvider>
                </WeatherProvider>
              </AlarmProvider>
            </NotificationProvider>
          </WorkProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}

// Replace the AppLoadingScreen function with SplashScreen
// App loading screen
const AppLoadingScreen = () => {
  return <SplashScreen />
}

// AppContent component that uses context values
const AppContent = () => {
  // Use context directly with useContext instead of custom hooks
  const themeContext = useContext(ThemeContext)
  const { theme, isDarkMode, isLoading: isThemeLoading } = themeContext

  // Get translation function from context
  const languageContext = useContext(LanguageContext)
  const { t, isLoading: isLanguageLoading } = languageContext

  const { initializeDefaultShifts } = shiftUtils
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Kiểm tra xem đã có ca làm việc mặc định chưa
        const shiftsData = await AsyncStorage.getItem("shifts")
        if (!shiftsData) {
          // Nếu chưa có, khởi tạo ca làm việc mặc định
          await initializeDefaultShifts()
        }
      } catch (error) {
        console.error("Error initializing app:", error)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeApp()
  }, [initializeDefaultShifts])

  // Show loading indicator if any context is still loading
  if (isThemeLoading || isLanguageLoading || isInitializing) {
    return <LoadingIndicator message="Loading app data..." />
  }

  return (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline"
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline"
            } else if (route.name === "Notes") {
              iconName = focused ? "document-text" : "document-text-outline"
            } else if (route.name === "Stats") {
              iconName = focused ? "stats-chart" : "stats-chart-outline"
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          children={() => <HomeStack theme={theme} t={t} />}
          options={{ tabBarLabel: t("tabs.home") }}
        />
        <Tab.Screen
          name="Notes"
          children={() => <NotesStack theme={theme} t={t} />}
          options={{ tabBarLabel: t("tabs.notes") }}
        />
        <Tab.Screen
          name="Stats"
          children={() => <StatsStack theme={theme} t={t} />}
          options={{ tabBarLabel: t("tabs.stats") }}
        />
        <Tab.Screen
          name="Settings"
          children={() => <SettingsStack theme={theme} t={t} />}
          options={{ tabBarLabel: t("tabs.settings") }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}


