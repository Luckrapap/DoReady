import React from 'react'

export function WifiOffIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="currentColor"
        >
            <path d="M12 21a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm.75-5.25h-1.5v-6h1.5v6ZM3.53 7.56a12 12 0 0 1 16.94 0l-1.06 1.06a10.5 10.5 0 0 0-14.82 0L3.53 7.56Zm3.18 3.18a7.5 7.5 0 0 1 10.58 0l-1.06 1.06a6 6 0 0 0-8.46 0l-1.06-1.06Z" />
        </svg>
    )
}
