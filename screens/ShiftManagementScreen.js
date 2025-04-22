"use client"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useTranslation, useWork } from "../hooks"
import { ShiftItem } from "../components"

const ShiftManagementScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { shifts, applyShift, deleteShift, isLoading } = useWork()
  const [refreshing, setRefreshing] = useState(false)

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
  }

  // Handle refreshing the list
  const handleRefresh = () => {
    setRefreshing(true)
    // In a real app, you would fetch fresh data here
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  // Handle applying a shift
  const handleApplyShift = (shiftId) => {
    Alert.alert(
      t("settings.applyShiftTitle") || "Apply Shift",
      t("settings.applyShiftMessage") || "Are you sure you want to apply this shift?",
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("common.confirm") || "Confirm",
          onPress: () => {
            applyShift(shiftId)
          },
        },
      ],
    )
  }

  // Handle editing a shift
  const handleEditShift = (shift) => {
    navigation.navigate("AddEditShift", { shift })
  }

  // Handle deleting a shift
  const handleDeleteShift = (shiftId) => {
    Alert.alert(
      t("settings.deleteShiftTitle") || "Delete Shift",
      t("settings.deleteShiftMessage") || "Are you sure you want to delete this shift?",
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("common.delete") || "Delete",
          style: "destructive",
          onPress: () => {
            deleteShift(shiftId)
          },
        },
      ],
    )
  }

  // Handle adding a new shift
  const handleAddShift = () => {
    navigation.navigate("AddEditShift")
  }

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>{t("settings.workShifts") || "Work Shifts"}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            {t("common.loading") || "Loading..."}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t("settings.workShifts") || "Work Shifts"}</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddShift}>
          <Ionicons name="add" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={shifts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ShiftItem
            shift={item}
            onApply={() => handleApplyShift(item.id)}
            onEdit={() => handleEditShift(item)}
            onDelete={() => handleDeleteShift(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={theme.textSecondary} style={styles.emptyIcon} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {t("settings.noShifts") || "No shifts available"}
            </Text>
            <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.primary }]} onPress={handleAddShift}>
              <Text style={styles.emptyButtonText}>{t("settings.addShift") || "Add Shift"}</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <TouchableOpacity style={[styles.floatingButton, { backgroundColor: theme.primary }]} onPress={handleAddShift}>
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
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
  headerRight: {
    width: 32,
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
})

export default ShiftManagementScreen
