import { cn } from '@/utils/utils'

interface LogoProps {
    className?: string;
    size?: number;
    style?: React.CSSProperties;
}

export default function Logo({ className, size, style }: LogoProps) {
    // Bold Harmony Calibration:
    // 1. Bold Scale (1.2x sizing to match typography weight)
    // 2. Exact Ratio (1.328)
    const logoHeight = size ? size * 1.2 : 40;
    const logoWidth = logoHeight;

    return (
        <div 
            className={cn("shrink-0 bg-zinc-950 dark:bg-zinc-50", className)}
            style={{ 
                width: logoWidth,
                height: logoHeight,
                WebkitMaskImage: 'url(/logo.png?v=2.1)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo.png?v=2.1)',
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
