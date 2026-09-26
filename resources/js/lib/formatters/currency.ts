export const currencyFormat = (value: number | string, options?: Intl.NumberFormatOptions): string => {
    const numberValue = typeof value === 'number' ? value : Number(value);

    if (isNaN(numberValue)) {
        return String(value);
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        ...options,
    });

    return formatter.format(numberValue);
};
