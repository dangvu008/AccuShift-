"use client"
import { View, StyleSheet } from "react-native"
import { useTheme } from "../../hooks"
import Skeleton from "../ui/Skeleton"

const SettingsScreenSkeleton = () => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* General Settings Section */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={150} height={24} borderRadius={4} style={styles.sectionTitle} />

        {/* Setting Items */}
        {[...Array(3)].map((_, index) => (
          <View key={index} style={[styles.settingItem, { borderBottomColor: theme.border }]}>
            <View style={styles.settingInfo}>
              <Skeleton width={200} height={20} borderRadius={4} style={styles.settingTitle} />
              <Skeleton width={250} height={16} borderRadius={4} style={styles.settingDescription} />
            </View>
            <Skeleton width={50} height={30} borderRadius={15} />
          </View>
        ))}
      </View>

      {/* Work Shifts Section */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={150} height={24} borderRadius={4} style={styles.sectionTitle} />

        {/* Shifts */}
        {[...Array(2)].map((_, index) => (
          <View key={index} style={[styles.shiftItem, { borderBottomColor: theme.border }]}>
            <View style={styles.shiftInfo}>
              <Skeleton width={180} height={20} borderRadius={4} style={styles.shiftName} />
              <Skeleton width={150} height={16} borderRadius={4} style={styles.shiftTime} />
              <Skeleton width={120} height={16} borderRadius={4} />
            </View>
            <View style={styles.shiftActions}>
              <Skeleton width={80} height={32} borderRadius={6} style={styles.actionButton} />
              <Skeleton width={36} height={36} borderRadius={18} style={styles.iconButton} />
              <Skeleton width={36} height={36} borderRadius={18} />
            </View>
          </View>
        ))}
      </View>

      {/* App Information */}
      <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Skeleton width={150} height={24} borderRadius={4} style={styles.sectionTitle} />

        <View style={[styles.infoItem, { borderBottomColor: theme.border }]}>
          <Skeleton width={100} height={20} borderRadius={4} />
          <Skeleton width={60} height={20} borderRadius={4} />
        </View>

        <View style={styles.infoItem}>
          <Skeleton width={100} height={20} borderRadius={4} />
          <Skeleton width={180} height={16} borderRadius={4} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    marginBottom: 8,
  },
  settingDescription: {},
  shiftItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  shiftInfo: {
    marginBottom: 12,
  },
  shiftName: {
    marginBottom: 8,
  },
  shiftTime: {
    marginBottom: 8,
  },
  shiftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: 12,
  },
  iconButton: {
    marginRight: 8,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
})

export default SettingsScreenSkeleton
