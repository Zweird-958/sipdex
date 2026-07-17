import { Check, ChevronDown, X } from "lucide-react-native"
import { useMemo, useState } from "react"
import { Pressable, ScrollView, View } from "react-native"
import { Icon } from "@/components/ui/icon"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { cn } from "@/lib/utils"

export type MultiSelectOption = {
  label: string
  value: string
}

type MultiSelectProps = {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
}

const SelectedChips = ({
  options,
  placeholder,
  onRemove,
}: {
  options: MultiSelectOption[]
  placeholder?: string
  onRemove: (value: string) => void
}) => {
  if (options.length === 0) {
    return <Text className="text-muted-foreground text-sm">{placeholder}</Text>
  }

  return options.map((option) => (
    <View
      key={option.value}
      className="bg-muted h-5 flex-row items-center gap-1 rounded-full pl-2.5 pr-1"
    >
      <Text className="text-foreground text-xs">{option.label}</Text>
      <Pressable
        hitSlop={6}
        onPress={() => onRemove(option.value)}
        accessibilityLabel={`Remove ${option.label}`}
      >
        <Icon as={X} className="text-muted-foreground size-4" />
      </Pressable>
    </View>
  ))
}

const OptionList = ({
  options,
  value,
  emptyText,
  onToggle,
}: {
  options: MultiSelectOption[]
  value: string[]
  emptyText?: string
  onToggle: (value: string) => void
}) => {
  if (options.length === 0) {
    return (
      <Text className="text-muted-foreground p-3 text-center text-sm">
        {emptyText}
      </Text>
    )
  }

  return options.map((option) => (
    <Pressable
      key={option.value}
      onPress={() => onToggle(option.value)}
      className="active:bg-accent flex-row items-center justify-between rounded-sm px-3 py-2"
    >
      <Text className="text-popover-foreground text-sm">{option.label}</Text>
      {value.includes(option.value) && (
        <Icon as={Check} className="text-foreground size-4" />
      )}
    </Pressable>
  ))
}

export const MultiSelect = ({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
  emptyText,
  disabled,
}: MultiSelectProps) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [triggerHeight, setTriggerHeight] = useState(0)

  const selectedOptions = useMemo(
    () => options.filter((option) => value.includes(option.value)),
    [options, value],
  )

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return options
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(normalized),
    )
  }, [options, query])

  const toggle = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((current) => current !== optionValue)
        : [...value, optionValue],
    )
  }

  return (
    <View className="relative">
      <Pressable
        disabled={disabled}
        onLayout={({ nativeEvent }) =>
          setTriggerHeight(nativeEvent.layout.height)
        }
        onPress={() => setOpen((current) => !current)}
        className={cn(
          "border-input bg-background min-h-10 flex-row items-center justify-between gap-2 rounded-md border px-3 py-2 shadow-sm shadow-black/5",
          disabled && "opacity-50",
        )}
      >
        <View className="flex-1 flex-row flex-wrap gap-1.5">
          <SelectedChips
            options={selectedOptions}
            placeholder={placeholder}
            onRemove={toggle}
          />
        </View>
        <Icon as={ChevronDown} className="text-muted-foreground size-4" />
      </Pressable>

      {open && (
        <View
          style={{ top: triggerHeight + 4, elevation: 8 }}
          className="bg-popover border-border absolute left-0 right-0 z-50 rounded-md border p-1 shadow-md shadow-black/10"
        >
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            autoCapitalize="none"
            autoCorrect={false}
            className="mb-1"
          />
          <ScrollView className="max-h-60" keyboardShouldPersistTaps="handled">
            <OptionList
              options={filteredOptions}
              value={value}
              emptyText={emptyText}
              onToggle={toggle}
            />
          </ScrollView>
        </View>
      )}
    </View>
  )
}
