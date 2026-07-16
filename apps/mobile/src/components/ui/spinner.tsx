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
import { Icon } from "@/components/ui/icon"

type SpinnerProps = {
  size?: number
  className?: string
}

const SPIN_DURATION = 1000
const FULL_TURN = 360

export const Spinner = ({ size = 24, className }: SpinnerProps) => {
  const rotation = useSharedValue(0)

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
    <Animated.View style={animatedStyle}>
      <Icon as={LoaderCircle} size={size} className={className} />
    </Animated.View>
  )
}
