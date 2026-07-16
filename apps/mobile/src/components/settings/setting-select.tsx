import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type SettingOption = {
  value: string
  label: string
}

type SettingSelectProps = {
  value: string
  options: SettingOption[]
  onChange: (value: string) => void
}

const PADDING = 16

export const SettingSelect = ({
  value,
  options,
  onChange,
}: SettingSelectProps) => {
  const contentInsets = {
    left: PADDING,
    right: PADDING,
  }
  const selected = options.find((option) => option.value === value)

  return (
    <Select
      value={selected}
      onValueChange={(option) => {
        if (option) {
          onChange(option.value)
        }
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="" />
      </SelectTrigger>
      <SelectContent
        insets={contentInsets}
        className="max-h-60 w-full overflow-y-auto"
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            label={option.label}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
