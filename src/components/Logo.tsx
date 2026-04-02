import { cn } from '@/utils/utils'

interface LogoProps {
    className?: string;
    size?: number;
    style?: React.CSSProperties;
}

export default function Logo({ className, size, style }: LogoProps) {
    // Bold Harmony Calibration:
    // 1. Bold Scale (1.15x sizing to match typography weight)
    // 2. Exact Ratio (1.328)
    const logoHeight = size ? size * 1.15 : 36;
    const logoWidth = logoHeight * 1.328;

    return (
        <div 
            className={cn("shrink-0 bg-current", className)}
            style={{ 
                width: logoWidth,
                height: logoHeight,
                WebkitMaskImage: 'url(/logo.png)',
                WebkitMaskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskImage: 'url(/logo.png)',
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
