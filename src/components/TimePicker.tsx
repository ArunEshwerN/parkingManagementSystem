import React from 'react';

interface TimePickerProps {
    value: string;
    onChange: (value: string) => void;
    min: string;
    max: string;
}

export function TimePicker({ value, onChange, min, max }: TimePickerProps) {
    const generateTimeOptions = () => {
        const options = [];
        const start = new Date(`2000-01-01T${min}`);
        const end = new Date(`2000-01-01T${max}`);

        while (start <= end) {
            options.push(start.toTimeString().slice(0, 5));
            start.setMinutes(start.getMinutes() + 60);
        }

        return options;
    };

    const timeOptions = generateTimeOptions();

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
            {timeOptions.map((time) => (
                <option key={time} value={time}>
                    {time}
                </option>
            ))}
        </select>
    );
}
