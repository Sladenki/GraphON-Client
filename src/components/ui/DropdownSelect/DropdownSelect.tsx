import React from 'react';
import { Select, SelectItem } from '@heroui/react';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownSelectProps {
  options: DropdownOption[];
  error?: string;
  label?: string;
  description?: string;
  placeholder?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
  selectionMode?: 'single' | 'multiple';
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  options,
  error,
  label,
  description,
  placeholder,
  value,
  onChange,
  required,
  disabled,
  className,
  name,
  selectionMode = 'single',
}) => {
  const selectedKeys = React.useMemo<Set<string> | string[]>(() => {
    if (selectionMode === 'multiple') {
      const arr = Array.isArray(value) ? value : value ? [value] : [];
      return new Set(arr as string[]);
    }
    const v = Array.isArray(value) ? value[0] : value;
    return v ? [v] : [];
  }, [selectionMode, value]);

  return (
    <Select
      label={label}
      placeholder={placeholder}
      description={description}
      errorMessage={error}
      isInvalid={!!error}
      isRequired={required}
      isDisabled={disabled}
      selectedKeys={selectedKeys as any}
      selectionMode={selectionMode as any}
      onSelectionChange={(keys) => {
        if (!onChange) return;
        const list = Array.isArray(keys) ? keys : Array.from(keys as Set<any>).map(String);
        if (selectionMode === 'multiple') {
          onChange(list);
        } else {
          onChange(list[0] || '');
        }
      }}
      className={className}
      classNames={{
        base: 'max-w-full',
        trigger: 'h-12 border-1.5',
        value: 'text-sm font-normal',
        label: 'text-sm font-semibold',
        errorMessage: 'text-xs',
      }}
      variant="bordered"
      radius="lg"
      name={name}
    >
      {options.map((option) => (
        <SelectItem key={option.value}>{option.label}</SelectItem>
      ))}
    </Select>
  );
};

export default DropdownSelect;


