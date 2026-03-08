import { cn } from '@/utils/utils'

interface LogoProps {
    className?: string;
    size?: number;
    style?: React.CSSProperties;
}

export default function Logo({ className, size = 32, style }: LogoProps) {
    return (
        <div 
            className={cn("shrink-0 bg-current", className)}
            style={{ 
                width: size, 
                height: size,
                WebkitMaskImage: 'url(/logo.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                transform: 'scale(2.4)', // Slightly larger scale
                transformOrigin: 'center',
                ...style
            }} 
        />
    )
}
