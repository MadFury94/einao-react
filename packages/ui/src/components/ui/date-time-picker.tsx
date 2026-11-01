import * as React from 'react'
import { cn } from '../../lib/utils'

export type DateTimePickerProps = {
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  /** Informational only; not enforced field-by-field. */
  minDate?: Date
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/**
 * WordPress-style inline date/time picker with separate fields for hours,
 * minutes, AM/PM, day, month, and year. Renders inline (no popover/calendar).
 */
export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  className,
  minDate,
}: DateTimePickerProps) {
  // Show defaults when no value yet; only commit once the user edits a field.
  const baseDate = value ?? minDate ?? new Date()
  const hours24 = baseDate.getHours()
  const isPM = hours24 >= 12
  const hours12 = hours24 % 12 || 12
  const minutes = baseDate.getMinutes()
  const day = baseDate.getDate()
  const month = baseDate.getMonth()
  const year = baseDate.getFullYear()

  function emit(patch: {
    hours12?: number
    minutes?: number
    day?: number
    month?: number
    year?: number
    isPM?: boolean
  }) {
    const next = new Date(baseDate)
    const nextIsPM = patch.isPM ?? isPM
    const nextHours12 = patch.hours12 ?? hours12
    const nextHours24 = (nextHours12 % 12) + (nextIsPM ? 12 : 0)
    next.setHours(nextHours24)
    if (patch.minutes !== undefined) next.setMinutes(patch.minutes)
    if (patch.year !== undefined) next.setFullYear(patch.year)
    if (patch.month !== undefined) {
      const lastDay = new Date(next.getFullYear(), patch.month + 1, 0).getDate()
      next.setDate(Math.min(next.getDate(), lastDay))
      next.setMonth(patch.month)
    }
    if (patch.day !== undefined) {
      const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
      next.setDate(Math.min(Math.max(1, patch.day), lastDay))
    }
    next.setSeconds(0, 0)
    onChange(next)
  }

  return (
    <div className={cn('space-y-4', className)} aria-disabled={disabled}>
      {/* TIME */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Time
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border bg-background px-2 focus-within:ring-1 focus-within:ring-ring">
            <NumberField
              value={hours12}
              min={1}
              max={12}
              pad={2}
              onCommit={(n) => emit({ hours12: n })}
              ariaLabel="Hours"
              disabled={disabled}
              className="w-8"
            />
            <span className="text-muted-foreground">:</span>
            <NumberField
              value={minutes}
              min={0}
              max={59}
              pad={2}
              onCommit={(n) => emit({ minutes: n })}
              ariaLabel="Minutes"
              disabled={disabled}
              className="w-8"
            />
          </div>
          <div className="inline-flex rounded-md border bg-background p-0.5">
            <MeridiemButton
              label="AM"
              selected={!isPM}
              onClick={() => emit({ isPM: false })}
              disabled={disabled}
            />
            <MeridiemButton
              label="PM"
              selected={isPM}
              onClick={() => emit({ isPM: true })}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      {/* DATE */}
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Date
        </p>
        <div className="flex items-center gap-2">
          <div className="rounded-md border bg-background px-2 focus-within:ring-1 focus-within:ring-ring">
            <NumberField
              value={day}
              min={1}
              max={31}
              onCommit={(n) => emit({ day: n })}
              ariaLabel="Day"
              disabled={disabled}
              className="w-8"
            />
          </div>
          <select
            value={month}
            onChange={(event) => emit({ month: parseInt(event.target.value, 10) })}
            disabled={disabled}
            aria-label="Month"
            className="h-9 flex-1 rounded-md border bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index}>
                {name}
              </option>
            ))}
          </select>
          <div className="rounded-md border bg-background px-2 focus-within:ring-1 focus-within:ring-ring">
            <NumberField
              value={year}
              min={1970}
              max={9999}
              onCommit={(n) => emit({ year: n })}
              ariaLabel="Year"
              disabled={disabled}
              className="w-14"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function MeridiemButton({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string
  selected: boolean
  onClick: () => void
  disabled: boolean
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-8 min-w-9 items-center justify-center rounded px-2 text-xs font-semibold transition',
        selected ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
        disabled && 'opacity-50'
      )}
    >
      {label}
    </button>
  )
}

/** Controlled number input with local text state so users can clear & retype. */
function NumberField({
  value,
  min,
  max,
  pad,
  onCommit,
  ariaLabel,
  disabled,
  className,
}: {
  value: number
  min: number
  max: number
  pad?: number
  onCommit: (n: number) => void
  ariaLabel: string
  disabled: boolean
  className?: string
}) {
  const format = React.useCallback(
    (n: number) => (pad ? String(n).padStart(pad, '0') : String(n)),
    [pad]
  )
  const [text, setText] = React.useState(() => format(value))
  const [focused, setFocused] = React.useState(false)

  React.useEffect(() => {
    if (!focused) setText(format(value))
  }, [value, focused, format])

  function commit(raw: string) {
    const num = parseInt(raw, 10)
    if (Number.isNaN(num)) {
      setText(format(value))
      return
    }
    const clamped = Math.min(max, Math.max(min, num))
    setText(format(clamped))
    if (clamped !== value) onCommit(clamped)
  }

  const maxLength = String(max).length

  return (
    <input
      type="text"
      inputMode="numeric"
      value={text}
      onChange={(event) => setText(event.target.value.replace(/\D/g, '').slice(0, maxLength))}
      onFocus={(event) => {
        setFocused(true)
        event.target.select()
      }}
      onBlur={() => {
        setFocused(false)
        commit(text)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          commit(text)
          event.currentTarget.blur()
        }
      }}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'h-9 bg-transparent text-center text-sm tabular-nums outline-none disabled:opacity-50',
        className
      )}
    />
  )
}
