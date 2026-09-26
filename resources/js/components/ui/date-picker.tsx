import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseLocalDate, toLocalISO } from '@/lib/formatters/dates';
import { cn } from '@/lib/utils';

interface DatePickerProps {
    /** Value as a `yyyy-MM-dd` string (or null/empty when unset). */
    value?: string | null;
    /** Receives a `yyyy-MM-dd` string, or null when cleared. */
    onChange: (value: string | null) => void;
    placeholder?: string;
    align?: 'start' | 'center' | 'end';
    className?: string;
    disabled?: boolean;
    clearable?: boolean;
}

export function DatePicker({
    value,
    onChange,
    placeholder = 'Seleccionar fecha',
    align = 'start',
    className,
    disabled,
    clearable,
}: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const selected = value ? parseLocalDate(value) : undefined;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <div className="relative w-full">
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={disabled}
                        className={cn('w-full justify-start px-3 font-normal', !selected && 'text-muted-foreground', clearable && selected && 'pr-8', className)}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selected ? format(selected, 'dd/MM/yyyy') : <span>{placeholder}</span>}
                    </Button>
                </PopoverTrigger>
                {clearable && selected && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onChange(null); }}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        <XIcon className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            <PopoverContent className="w-auto p-0" align={align}>
                <Calendar
                    mode="single"
                    locale={es}
                    defaultMonth={selected}
                    selected={selected}
                    onSelect={(date) => { onChange(date ? toLocalISO(date) : null); setOpen(false); }}
                />
            </PopoverContent>
        </Popover>
    );
}
