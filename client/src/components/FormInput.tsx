import { LucideIcon } from "lucide-react";

interface FormInputProps {
    type: string;
    name: string;
    placeholder: string;
    icon: LucideIcon;
    required?: boolean;
    className?: string;
}

export default function FormInput({
    type,
    name,
    placeholder,
    icon: Icon,
    required = false,
    className = "",
}: FormInputProps) {
    const isPassword = type === "password";
    const inputClassName = isPassword
        ? "w-full bg-transparent outline-none text-[#1a1a1a] placeholder:text-[#1a1a1a] text-base tracking-wider"
        : "w-full outline-none text-[#1a1a1a] placeholder:text-[#9ca3af] text-base";

    return (
        <div className={`relative ${className}`}>
            <div className="flex items-center gap-3 rounded-2xl bg-[#e5e5e5a2] px-5 py-4 border border-transparent focus-within:border-neutral-300 transition-colors">
                <Icon className="h-5 w-5 text-[#9ca3af]" />
                <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    className={inputClassName}
                    required={required}
                />
            </div>
        </div>
    );
}
