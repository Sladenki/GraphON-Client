'use client'

import React from 'react'
import DatePickerField from '@/components/ui/DatePickerField/DatePickerField'

export interface DateRangeFilterClassNames {
  section?: string
  row?: string
  field?: string
  tbdToggle?: string
  datePicker?: string
}

export interface DateRangeFilterProps {
  dateFrom?: string
  dateTo?: string
  includeTbd?: boolean
  onDateFromChange?: (value: string) => void
  onDateToChange?: (value: string) => void
  onIncludeTbdChange?: (value: boolean) => void
  classNames?: DateRangeFilterClassNames
  ariaLabel?: string
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  dateFrom,
  dateTo,
  includeTbd,
  onDateFromChange,
  onDateToChange,
  onIncludeTbdChange,
  classNames = {},
  ariaLabel = 'Фильтр по датам'
}) => {
  return (
    <div className={classNames.section} role="group" aria-label={ariaLabel}>
      <div className={classNames.row}>
        <label className={classNames.field}>
          <span>С</span>
          <DatePickerField
            ariaLabel="От даты"
            size="sm"
            value={dateFrom}
            onChange={(v) => onDateFromChange?.(v)}
            className={classNames.datePicker}
          />
        </label>
        <label className={classNames.field}>
          <span>По</span>
          <DatePickerField
            ariaLabel="До даты"
            size="sm"
            value={dateTo}
            onChange={(v) => onDateToChange?.(v)}
            className={classNames.datePicker}
          />
        </label>
      </div>
      {/* <label className={classNames.tbdToggle}>
        <input
          type="checkbox"
          checked={includeTbd ?? true}
          onChange={(e) => onIncludeTbdChange?.(e.target.checked)}
        />
        <span>Показывать без даты</span>
      </label> */}
    </div>
  )
}

export default DateRangeFilter


