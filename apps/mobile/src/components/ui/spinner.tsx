import { LoaderCircle } from "lucide-react-native"
import { useEffect } from "react"
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import { useForegroundColor } from "@/hooks/use-foreground-color"

type SpinnerProps = {
  size?: number
  className?: string
}

const SPIN_DURATION = 1000
const FULL_TURN = 360

export const Spinner = ({ size = 24, className }: SpinnerProps) => {
  const rotation = useSharedValue(0)
  const color = useForegroundColor()

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(FULL_TURN, { duration: SPIN_DURATION, easing: Easing.linear }),
      -1,
    )

    return () => {
      cancelAnimation(rotation)
    }
  }, [rotation])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }))

  return (
    <Animated.View style={animatedStyle} className={className}>
      <LoaderCircle size={size} color={color} />
    </Animated.View>
  )
}
