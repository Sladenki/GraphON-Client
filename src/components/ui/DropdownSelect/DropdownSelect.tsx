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
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  name?: string;
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
}) => {
  return (
    <Select
      label={label}
      placeholder={placeholder}
      description={description}
      errorMessage={error}
      isInvalid={!!error}
      isRequired={required}
      isDisabled={disabled}
      selectedKeys={value ? [value] : []}
      onSelectionChange={(keys) => {
        const selected = Array.from(keys)[0];
        if (onChange && selected) {
          onChange(selected as string);
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


