'use client'

import React, { useMemo } from 'react'
import { DatePicker } from '@heroui/react'
import { parseDate } from '@internationalized/date'
import { I18nProvider } from '@react-aria/i18n'

export interface DatePickerFieldProps {
  value?: string
  onChange?: (value: string) => void
  label?: string
  ariaLabel?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'bordered' | 'flat' | 'faded' | 'underlined'
  className?: string
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  value,
  onChange,
  label,
  ariaLabel,
  size = 'sm',
  variant = 'bordered',
  className,
}) => {
  const calendarValue = useMemo(() => (value ? parseDate(value) : null), [value])

  return (
    <I18nProvider locale="ru-RU">
      <DatePicker
        label={label}
        aria-label={ariaLabel || label || 'Дата'}
        variant={variant as any}
        size={size as any}
        value={calendarValue as any}
        onChange={(v: any) => onChange?.(v ? v.toString() : '')}
        className={className}
      />
    </I18nProvider>
  )
}

export default DatePickerField


