'use client';

import { useEffect, useRef, useState } from 'react';

interface SecretInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

export default function SecretInput({
    value,
    onChange,
    disabled = false,
    placeholder = 'Enter 6-character secret',
    className = ''
}: SecretInputProps) {
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Ensure we have exactly 6 input refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 6);
    }, []);

    const handleInputChange = (index: number, char: string) => {
        if (char.length > 1) return; // Only allow single characters

        const newValue = value.split('');
        newValue[index] = char;
        const newSecret = newValue.join('').slice(0, 6); // Ensure max 6 characters

        onChange(newSecret);

        // Auto-focus next input if character was entered
        if (char && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();

            const newValue = value.split('');
            if (newValue[index]) {
                // Clear current position
                newValue[index] = '';
                onChange(newValue.join(''));
            } else if (index > 0) {
                // Move to previous position and clear it
                newValue[index - 1] = '';
                onChange(newValue.join(''));
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        } else if (e.key === 'Home') {
            inputRefs.current[0]?.focus();
        } else if (e.key === 'End') {
            inputRefs.current[5]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedText = e.clipboardData.getData('text').slice(0, 6);
        onChange(pastedText);

        // Focus the next empty input or the last one
        const nextIndex = Math.min(pastedText.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleFocus = (index: number) => {
        setFocusedIndex(index);
    };

    const handleBlur = () => {
        setFocusedIndex(-1);
    };

    const inputClasses = `
        w-12 h-12 text-center text-lg font-mono border-2 rounded-lg transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        ${disabled
            ? 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-white border-gray-300 hover:border-gray-400 text-gray-900 cursor-text'
        }
        ${focusedIndex >= 0 ? 'border-blue-500' : ''}
    `;

    return (
        <div className={`flex flex-col space-y-3 ${className}`}>
            <div className="flex space-x-2 justify-center">
                {Array.from({ length: 6 }, (_, index) => (
                    <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        maxLength={1}
                        value={value[index] || ''}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        onFocus={() => handleFocus(index)}
                        onBlur={handleBlur}
                        disabled={disabled}
                        className={inputClasses}
                        placeholder=""
                        autoComplete="off"
                        spellCheck={false}
                    />
                ))}
            </div>
            <p className="text-sm text-gray-500 text-center">
                {placeholder}
            </p>
        </div>
    );
} 