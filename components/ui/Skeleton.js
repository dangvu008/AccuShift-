import { StyleSheet, Animated, Easing } from "react-native"
import { useEffect, useRef } from "react"
import { useTheme } from "../../hooks"

const Skeleton = ({ width, height, borderRadius = 4, style }) => {
  const { isDarkMode } = useTheme()
  const opacityAnim = useRef(new Animated.Value(0.3)).current

  // Theme colors
  const backgroundColor = isDarkMode ? "#2C3A59" : "#E1E9EE"

  useEffect(() => {
    // Create the pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.6,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]),
    ).start()

    return () => {
      opacityAnim.stopAnimation()
    }
  }, [opacityAnim])

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
})

export default Skeleton
