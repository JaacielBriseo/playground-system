'use client';

import type React from 'react';
import { useState, forwardRef } from 'react';

import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
    /** The type of numeric input */
    type?: 'integer' | 'decimal';
    /** Number of decimal places (only applies when type is 'decimal') */
    decimalPlaces?: number;
    /** Minimum allowed value */
    min?: number;
    /** Maximum allowed value */
    max?: number;
    /** Current value */
    value?: number | string;
    /** Callback when value changes */
    onChange?: (value: number | null) => void;
    /** Allow negative numbers */
    allowNegative?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Label for the input */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Whether the input is required */
    required?: boolean;
}

const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
    (
        {
            type = 'decimal',
            decimalPlaces = 2,
            min,
            max,
            value,
            onChange,
            allowNegative = true,
            placeholder,
            label,
            error,
            required,
            className,
            disabled,
            ...props
        },
        ref,
    ) => {
        const initialInputValue = (() => {
            if (value === null || value === undefined || value === '') {
                return '';
            }
            const numValue = typeof value === 'string' ? Number.parseFloat(value) : value;
            if (!isNaN(numValue)) {
                return numValue.toString();
            }
            return '';
        })();

        const [inputValue, setInputValue] = useState<string>(initialInputValue);

        const isValidInput = (input: string): boolean => {
            if (input === '' || input === '-') return true;

            // Create regex pattern based on configuration
            let pattern: RegExp;
            if (type === 'integer') {
                pattern = allowNegative ? /^-?\d+$/ : /^\d+$/;
            } else {
                // Allow decimal inputs with up to specified decimal places
                const decimalPattern = decimalPlaces > 0 ? `(\\.\\d{0,${decimalPlaces}})?` : '';
                pattern = allowNegative ? new RegExp(`^-?\\d*${decimalPattern}$`) : new RegExp(`^\\d*${decimalPattern}$`);
            }

            return pattern.test(input);
        };

        const castValue = (input: string): number | null => {
            if (input === '' || input === '-' || input === '.') return null;

            const numValue = Number.parseFloat(input);
            if (isNaN(numValue)) return null;

            // Apply type-specific casting
            let castedValue: number;
            if (type === 'integer') {
                castedValue = Math.round(numValue);
            } else {
                // Round to specified decimal places
                castedValue = Math.round(numValue * Math.pow(10, decimalPlaces)) / Math.pow(10, decimalPlaces);
            }

            // Apply min/max constraints
            if (min !== undefined && castedValue < min) castedValue = min;
            if (max !== undefined && castedValue > max) castedValue = max;

            return castedValue;
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newInput = e.target.value;

            // Always update the input value for immediate visual feedback
            setInputValue(newInput);

            // Cast and validate the value
            if (isValidInput(newInput)) {
                const castedValue = castValue(newInput);
                onChange?.(castedValue);
            } else {
                // For invalid input, keep the display but don't call onChange
                // This allows users to type intermediate values like "1." or "-"
                const lastValidChar = newInput.slice(0, -1);
                if (isValidInput(lastValidChar)) {
                    setInputValue(lastValidChar);
                    const castedValue = castValue(lastValidChar);
                    onChange?.(castedValue);
                }
            }
        };

        const handleBlur = () => {
            // On blur, format the value properly
            if (inputValue === '' || inputValue === '-' || inputValue === '.') {
                setInputValue('');
                onChange?.(null);
                return;
            }

            const castedValue = castValue(inputValue);
            if (castedValue !== null) {
                // Format the display value
                let formattedValue: string;
                if (type === 'integer') {
                    formattedValue = castedValue.toString();
                } else {
                    formattedValue = castedValue.toFixed(decimalPlaces);
                }
                setInputValue(formattedValue);
                onChange?.(castedValue);
            } else {
                setInputValue('');
                onChange?.(null);
            }
        };

        return (
            <div className="space-y-2">
                {label && (
                    <Label htmlFor={props.id} className={cn(required && "after:ml-0.5 after:text-red-500 after:content-['*']")}>
                        {label}
                    </Label>
                )}
                <Input
                    ref={ref}
                    {...props}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn(error && 'border-red-500 focus-visible:ring-red-500', className)}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    },
);

NumericInput.displayName = 'NumericInput';

export { NumericInput };
