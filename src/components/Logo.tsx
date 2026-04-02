import { cn } from '@/utils/utils'

interface LogoProps {
    className?: string;
    size?: number;
    style?: React.CSSProperties;
}

export default function Logo({ className, size, style }: LogoProps) {
    // Bold Harmony Calibration:
    // 1. Anchor Scale (2.8x to make the icon distinctively larger than the typography)
    const logoHeight = size ? size * 2.8 : 86;
    const logoWidth = logoHeight * 1.1; // Balanced width vs text weight

    return (
        <div 
            className={cn("shrink-0 bg-zinc-950 dark:bg-zinc-50 -ml-10 -mr-10 -translate-y-2", className)}
            style={{ 
                width: logoWidth,
                height: logoHeight,
                WebkitMaskImage: 'url(/logo.png?v=2.9-LeftAlignStrong)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo.png?v=2.9-LeftAlignStrong)',
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
