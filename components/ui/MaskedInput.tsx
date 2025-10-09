"use client";

import { forwardRef, InputHTMLAttributes, ChangeEvent, useEffect, useState } from "react";

interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  mask?: 'phone' | 'none';
  onChange?: (value: string, maskedValue: string) => void;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ label, icon, error, mask = 'none', onChange, value, className = "", ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState("");
    const [mounted, setMounted] = useState(false);

    // Evitar erro de hidratação
    useEffect(() => {
      setMounted(true);
      if (value) {
        const initialValue = value.toString();
        if (mask === 'phone') {
          setDisplayValue(applyPhoneMask(initialValue));
        } else {
          setDisplayValue(initialValue);
        }
      }
    }, []);

    // Atualizar quando value mudar externamente
    useEffect(() => {
      if (mounted && value !== undefined) {
        const newValue = value.toString();
        if (mask === 'phone') {
          setDisplayValue(applyPhoneMask(newValue));
        } else {
          setDisplayValue(newValue);
        }
      }
    }, [value, mask, mounted]);

    const applyPhoneMask = (value: string): string => {
      // Remove tudo que não é número
      const numbers = value.replace(/\D/g, "");

      // Aplica máscara baseado no tamanho
      if (numbers.length <= 10) {
        // (XX) XXXX-XXXX
        return numbers
          .replace(/^(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{4})(\d)/, "$1-$2");
      } else {
        // (XX) XXXXX-XXXX
        return numbers
          .replace(/^(\d{2})(\d)/, "($1) $2")
          .replace(/(\d{5})(\d)/, "$1-$2")
          .slice(0, 15); // Limita ao tamanho máximo
      }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      if (mask === 'phone') {
        const maskedValue = applyPhoneMask(inputValue);
        const rawValue = inputValue.replace(/\D/g, "");

        setDisplayValue(maskedValue);
        onChange?.(rawValue, maskedValue);
      } else {
        setDisplayValue(inputValue);
        onChange?.(inputValue, inputValue);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F1FFFA]/70 transition-colors duration-200 peer-focus:text-[#177245]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            value={displayValue}
            onChange={handleChange}
            className={`
              peer w-full px-4 py-2.5 rounded-lg border transition-all duration-200 text-[#F1FFFA]
              ${icon ? "pl-11" : ""}
              ${error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-950/20"
                : "border-[#3a3737] focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20 bg-[#2a2727] hover:border-[#4a4747]"
              }
              placeholder:text-[#F1FFFA]/50
              disabled:bg-[#212020] disabled:cursor-not-allowed
              outline-none
              ${className}
            `}
            {...props}
          />
          {error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1 animate-in fade-in slide-in-from-top-1 duration-200">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export default MaskedInput;

