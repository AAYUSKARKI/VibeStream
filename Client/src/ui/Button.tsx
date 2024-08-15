import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    bgColor?: string;
    textColor?: string;
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    children,
    type = "button",
    bgColor = "blue",
    textColor = "text-white",
    className = "",
    ...props
}) => {
    return (
        <button
            type={type}  // Ensure the 'type' attribute is correctly passed to the button element
            className={`${bgColor} ${textColor} ${className} hover:scale-110 duration-100 ease-in`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
