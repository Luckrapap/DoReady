import { cn } from '@/utils/utils'

interface LogoProps {
    className?: string;
    size?: number;
    width?: number;
    height?: number;
    style?: React.CSSProperties;
}

export default function Logo({ className, size = 32, width, height, style }: LogoProps) {
    const finalWidth = width || size;
    const finalHeight = height || size;
    
    return (
        <div 
            className={cn("shrink-0 bg-current", className)}
            style={{ 
                width: finalWidth, 
                height: finalHeight,
                WebkitMaskImage: 'url(/LogoPrincipal.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/LogoPrincipal.png)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                ...style
            }} 
        />
    )
}
