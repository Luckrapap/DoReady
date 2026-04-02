import { cn } from '@/utils/utils'

interface LogoProps {
    className?: string;
    size?: number;
    style?: React.CSSProperties;
}

export default function Logo({ className, size, style }: LogoProps) {
    // Bold Harmony Calibration:
    // 1. Bold Scale (1.8x sizing to compensate for image padding)
    const logoHeight = size ? size * 1.8 : 64;
    const logoWidth = logoHeight;

    return (
        <div 
            className={cn("shrink-0 bg-zinc-950 dark:bg-zinc-50", className)}
            style={{ 
                width: logoWidth,
                height: logoHeight,
                WebkitMaskImage: 'url(/logo.png?v=2.2-MacroLogo)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo.png?v=2.2-MacroLogo)',
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
