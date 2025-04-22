"use client"
import { View, StyleSheet } from "react-native"
import { useTheme } from "../../hooks"
import Skeleton from "../ui/Skeleton"

const NotesScreenSkeleton = () => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={24} height={24} borderRadius={12} style={styles.searchIcon} />
        <Skeleton width={250} height={20} borderRadius={4} />
      </View>

      {/* Notes List */}
      {[...Array(5)].map((_, index) => (
        <View key={index} style={[styles.noteCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.noteHeader}>
            <Skeleton width={200} height={20} borderRadius={4} />
            <Skeleton width={80} height={24} borderRadius={12} />
          </View>
          <Skeleton width={300} height={16} borderRadius={4} style={styles.noteContent} />
          <Skeleton width={250} height={16} borderRadius={4} style={styles.noteContent} />
          <View style={styles.noteFooter}>
            <Skeleton width={120} height={16} borderRadius={4} />
            <Skeleton width={24} height={24} borderRadius={12} />
          </View>
        </View>
      ))}

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        <Skeleton width={56} height={56} borderRadius={28} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  noteCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  noteContent: {
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  fabContainer: {
    position: "absolute",
    right: 24,
    bottom: 24,
  },
})

export default NotesScreenSkeleton
