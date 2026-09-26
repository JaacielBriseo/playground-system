export const numberWithCommas = (value: number | string): string => {
    const numberValue = typeof value === 'number' ? value : Number(value);

    if (isNaN(numberValue)) {
        return String(value);
    }

    return numberValue.toLocaleString('en-US');
};
