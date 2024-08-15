import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    type?: "text" | "number" | "password" | "email" | "date" | "time";
    placeholder?: string;
    className?: string;
    ref?: React.ForwardedRef<HTMLInputElement>;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
    { label, type = "text", placeholder = "", className = "", ...props },
    ref
) {
    const id = useId();
    return (
        <div className="w-full">
            {label && (
                <label className="inline-block mb-1 pl-1" htmlFor={id}>
                    {label}
                </label>
            )}
            <input
                type={type}
                placeholder={placeholder}
                className={`px-3 py-2 bg-[#0E0F0F] text-white outline-none focus:bg-[#222222] duration-200 border border-slate-600 w-full ${className}`}
                ref={ref}
                id={id}
                {...props}
            />
        </div>
    );
});

export default Input;
