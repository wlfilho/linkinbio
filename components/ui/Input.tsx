"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  success?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, success, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#F1FFFA]/90 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className={`
              absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200
              ${error ? "text-red-500" : success ? "text-[#177245]" : "text-[#F1FFFA]/70"}
            `}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              peer w-full px-4 py-2.5 rounded-lg border transition-all duration-200 text-[#F1FFFA]
              ${icon ? "pl-11" : ""}
              ${error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 bg-red-950/20"
                : success
                ? "border-[#177245] focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20 bg-[#177245]/10"
                : "border-[#3a3737] focus:border-[#177245] focus:ring-2 focus:ring-[#177245]/20 bg-[#2a2727] hover:border-[#4a4747]"
              }
              placeholder:text-[#F1FFFA]/50
              disabled:bg-[#212020] disabled:cursor-not-allowed
              outline-none
              [&:-webkit-autofill]:!bg-[#2a2727]
              [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_#2a2727_inset]
              [&:-webkit-autofill]:[-webkit-text-fill-color:#F1FFFA]
              [&:-webkit-autofill:hover]:!bg-[#2a2727]
              [&:-webkit-autofill:focus]:!bg-[#2a2727]
              [&:-webkit-autofill:active]:!bg-[#2a2727]
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
          {success && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
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

Input.displayName = "Input";

export default Input;

