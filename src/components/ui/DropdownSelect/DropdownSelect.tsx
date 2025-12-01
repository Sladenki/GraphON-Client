import React from 'react';
import { Select, SelectItem, Input } from '@heroui/react';

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
  searchable?: boolean;
  searchPlaceholder?: string;
  noResultsLabel?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  autoFocus?: boolean;
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
  searchable = false,
  searchPlaceholder = 'Поиск...',
  noResultsLabel = 'Ничего не найдено',
  isOpen,
  onOpenChange,
  autoFocus,
}) => {
  const selectedKeys = React.useMemo<Set<string> | string[]>(() => {
    if (selectionMode === 'multiple') {
      const arr = Array.isArray(value) ? value : value ? [value] : [];
      return new Set(arr as string[]);
    }
    const v = Array.isArray(value) ? value[0] : value;
    return v ? [v] : [];
  }, [selectionMode, value]);

  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.trim().toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery, searchable]);

  const selectProps: Record<string, unknown> = {};
  if (typeof isOpen === 'boolean') {
    selectProps.isOpen = isOpen;
  }
  if (onOpenChange) {
    selectProps.onOpenChange = onOpenChange;
  }
  if (autoFocus) {
    selectProps.autoFocus = autoFocus;
  }

  const wrapperClassName = ['flex flex-col gap-3 w-full', className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClassName}>
      {searchable && (
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onValueChange={setSearchQuery}
          variant="bordered"
          radius="lg"
          size="md"
          className="max-w-full"
          classNames={{
            input: 'text-sm',
          }}
        />
      )}

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
        className="max-w-full"
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
        {...selectProps}
      >
        {filteredOptions.length > 0 ? (
          filteredOptions.map((option) => (
            <SelectItem key={option.value}>{option.label}</SelectItem>
          ))
        ) : (
          <SelectItem key="no-results" isDisabled>
            {noResultsLabel}
          </SelectItem>
        )}
      </Select>
    </div>
  );
};

export default DropdownSelect;


