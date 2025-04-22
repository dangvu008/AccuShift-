"use client"
import React from "react"
import { View, Text, StyleSheet, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks"

const ActionHistoryTimeline = ({ actions }) => {
  const { isDarkMode } = useTheme()
  const fadeAnim = React.useRef(actions.map(() => new Animated.Value(0))).current

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Action colors
  const actionColors = {
    go_work: "#4A6FFF", // Blue
    check_in: "#4CD964", // Green
    check_out: "#FF9500", // Orange
    complete: "#FF3B30", // Red
    punch: "#AF52DE", // Purple
  }

  // Animate entries when component mounts
  React.useEffect(() => {
    const animations = actions.map((_, index) => {
      return Animated.timing(fadeAnim[index], {
        toValue: 1,
        duration: 500,
        delay: index * 300,
        useNativeDriver: false, // Set to false to work on web
      })
    })

    Animated.stagger(150, animations).start()
  }, [actions, fadeAnim])

  // Calculate time differences between actions
  const getTimeDifference = (currentAction, index) => {
    if (index === 0) return null

    const currentTime = new Date(`2000-01-01T${currentAction.time}:00`)
    const prevTime = new Date(`2000-01-01T${actions[index - 1].time}:00`)

    const diffMs = currentTime - prevTime
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffSeconds = Math.floor((diffMs % 60000) / 1000)

    if (diffMs === 0) return "+0s"
    if (diffMinutes === 0) return `+${diffSeconds}s`
    return `+${diffMinutes}m ${diffSeconds}s`
  }

  // Get action name translation
  const getActionName = (type) => {
    const actionNames = {
      go_work: "Đi làm",
      check_in: "Chấm công vào",
      check_out: "Chấm công ra",
      complete: "Hoàn tất",
      punch: "Ký công",
    }

    return actionNames[type] || type
  }

  if (!actions || actions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Chưa có hành động nào</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>Lịch sử hành động</Text>

      <View style={styles.timeline}>
        {actions.map((action, index) => (
          <Animated.View
            key={index}
            style={[
              styles.timelineItem,
              {
                opacity: fadeAnim[index],
                transform: [
                  {
                    translateY: fadeAnim[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Timeline connector */}
            {index < actions.length - 1 && (
              <View style={[styles.connector, { backgroundColor: actionColors[action.type] || theme.textSecondary }]} />
            )}

            {/* Time difference */}
            {getTimeDifference(action, index) && (
              <View style={styles.timeDiffContainer}>
                <Text style={[styles.timeDiff, { color: theme.textSecondary }]}>
                  {getTimeDifference(action, index)}
                </Text>
              </View>
            )}

            {/* Action dot */}
            <View style={[styles.dot, { backgroundColor: actionColors[action.type] || theme.textSecondary }]}>
              <Ionicons name={action.icon} size={14} color="#FFFFFF" />
            </View>

            {/* Action content */}
            <View style={styles.content}>
              <View style={styles.actionHeader}>
                <Text style={[styles.actionType, { color: theme.text }]}>{getActionName(action.type)}</Text>
                <Text style={[styles.time, { color: theme.textSecondary }]}>{action.time}</Text>
              </View>

              <View style={[styles.details, { backgroundColor: `${actionColors[action.type]}15` }]}>
                <Text style={[styles.detailText, { color: actionColors[action.type] || theme.text }]}>
                  {new Date(action.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          </Animated.View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
    position: "relative",
  },
  connector: {
    position: "absolute",
    left: 16,
    top: 32,
    width: 2,
    height: "100%",
    zIndex: 1,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    zIndex: 2,
  },
  content: {
    flex: 1,
    paddingBottom: 8,
  },
  actionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  actionType: {
    fontSize: 16,
    fontWeight: "500",
  },
  time: {
    fontSize: 14,
  },
  details: {
    padding: 8,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 14,
  },
  timeDiffContainer: {
    position: "absolute",
    left: 36,
    top: -18,
    zIndex: 3,
  },
  timeDiff: {
    fontSize: 12,
    fontStyle: "italic",
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    fontStyle: "italic",
  },
})

export default ActionHistoryTimeline
