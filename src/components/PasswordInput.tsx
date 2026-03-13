'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

interface PasswordInputProps {
    id?: string
    name?: string
    placeholder?: string
    required?: boolean
    minLength?: number
    className?: string
    style?: React.CSSProperties
    defaultValue?: string
    showIcon?: boolean
}

export default function PasswordInput({
    id,
    name,
    placeholder = '••••••••',
    required,
    minLength,
    className,
    style,
    defaultValue,
    showIcon = true
}: PasswordInputProps) {
    const [isVisible, setIsVisible] = useState(false)

    return (
        <div className="relative group w-full">
            {showIcon && (
                <Lock 
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black dark:group-focus-within:text-white transition-colors pointer-events-none" 
                    size={16} 
                />
            )}
            <input
                id={id}
                name={name}
                type={isVisible ? 'text' : 'password'}
                placeholder={placeholder}
                required={required}
                minLength={minLength}
                defaultValue={defaultValue}
                className={`${className} ${showIcon ? 'pl-10' : 'pl-4'} pr-12`}
                style={style}
            />
            <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all focus:outline-none"
                title={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
                {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
        </div>
    )
}
