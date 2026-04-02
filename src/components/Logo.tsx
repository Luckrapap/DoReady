import { cn } from '@/utils/utils'

interface LogoProps {
    className?: string;
    size?: number;
    style?: React.CSSProperties;
}

export default function Logo({ className, size, style }: LogoProps) {
    // Bold Harmony Calibration:
    // 1. Harmony Scale (2.2x to match bold typography weight and compensate padding)
    const logoHeight = size ? size * 2.2 : 72;
    const logoWidth = logoHeight * 1.1; // Balanced width vs text weight

    return (
        <div 
            className={cn("shrink-0 bg-zinc-950 dark:bg-zinc-50 -mr-5 -translate-y-1", className)}
            style={{ 
                width: logoWidth,
                height: logoHeight,
                WebkitMaskImage: 'url(/logo.png?v=2.4-Aligned)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo.png?v=2.4-Aligned)',
                maskSize: 'contain',
                maskRepeat: 'no-repeat',
                maskPosition: 'center',
                display: 'inline-block',
                verticalAlign: 'middle',
                marginTop: '0', // Reset absolute vertical centering
                ...style
            }} 
        />
    )
}
