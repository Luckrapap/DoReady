'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import MobileNavigationMenu from './MobileNavigationMenu'

export default function DraggableLayout({ children }: { children: React.ReactNode }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [drawerWidth, setDrawerWidth] = useState(320)

    useEffect(() => {
        setDrawerWidth(window.innerWidth)
        const handleResize = () => setDrawerWidth(window.innerWidth)
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const DRAWER_WIDTH = drawerWidth
    const x = useMotionValue(0)

    // Background Parallax Effects (ChatGPT style puro)
    // Para que ninguno "domine" al otro, el menú inferior no se queda casi estático. 
    // Ahora arranca al 50% de su propia pantalla, dándole mucha más velocidad para lograr un equilibrio 2:1.
    const bgX = useTransform(x, [0, DRAWER_WIDTH], [-drawerWidth * 0.5, 0])
    const foregroundShadow = useTransform(x, [0, DRAWER_WIDTH], ['-1px 0 15px rgba(0,0,0,0)', '-1px 0 15px rgba(0,0,0,0.04)'])

    // Un overlay negro sobre el menú de fondo que se aclara conforme se abre
    const bgOverlayOpacity = useTransform(x, [0, DRAWER_WIDTH], [0.6, 0])

    useEffect(() => {
        animate(x, isMenuOpen ? DRAWER_WIDTH : 0, {
            type: "spring",
            bounce: 0,
            duration: 0.35,
        });
    }, [isMenuOpen, x, DRAWER_WIDTH])

    // Escuchar evento de cierre disparado por los hipervínculos
    useEffect(() => {
        const handleClose = () => setIsMenuOpen(false);
        window.addEventListener('close-mobile-drawer', handleClose);
        return () => window.removeEventListener('close-mobile-drawer', handleClose);
    }, []);

    // Gestos Globales "Full Screen Swipe"
    useEffect(() => {
        if (typeof document === 'undefined') return;

        let startX = 0;
        let startY = 0;
        let isHorizontalSwipe = false;
        let isTracking = false;
        let swipeStartx = 0;
        let lastTouchTime = 0;
        let lastTouchX = 0;
        let velocityX = 0;

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 1) return;

            if (window.innerWidth >= 768) return;

            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            swipeStartx = x.get();
            isTracking = true;
            isHorizontalSwipe = false;
            lastTouchTime = Date.now();
            lastTouchX = startX;
            velocityX = 0;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isTracking) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const dx = currentX - startX;
            const dy = currentY - startY;

            if (!isHorizontalSwipe && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.5) {
                isHorizontalSwipe = true;
            }

            if (isHorizontalSwipe) {
                if (e.cancelable) e.preventDefault();

                const newX = Math.max(0, Math.min(DRAWER_WIDTH, swipeStartx + dx));
                x.set(newX);

                const now = Date.now();
                const dt = now - lastTouchTime;
                if (dt > 0) {
                    velocityX = (currentX - lastTouchX) / dt * 1000;
                }
                lastTouchTime = now;
                lastTouchX = currentX;
            } else if (Math.abs(dy) > 15) {
                isTracking = false;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!isTracking || !isHorizontalSwipe) {
                isTracking = false;
                return;
            }
            isTracking = false;

            const dx = e.changedTouches[0].clientX - startX;
            let nextOpen = isMenuOpen;

            const isIntentionalSwipeRight = dx > 50 || velocityX > 300;
            const isIntentionalSwipeLeft = dx < -50 || velocityX < -300;

            if (isMenuOpen && isIntentionalSwipeLeft) {
                nextOpen = false;
            } else if (!isMenuOpen && isIntentionalSwipeRight) {
                nextOpen = true;
            } else {
                if (x.get() > DRAWER_WIDTH / 2) {
                    nextOpen = true;
                } else {
                    nextOpen = false;
                }
            }

            setIsMenuOpen(nextOpen);

            if (nextOpen !== isMenuOpen) {
                Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
            } else {
                animate(x, nextOpen ? DRAWER_WIDTH : 0, {
                    type: "spring",
                    bounce: 0,
                    duration: 0.35,
                });
            }
        };

        document.addEventListener("touchstart", handleTouchStart, { passive: true });
        document.addEventListener("touchmove", handleTouchMove, { passive: false });
        document.addEventListener("touchend", handleTouchEnd);

        return () => {
            document.removeEventListener("touchstart", handleTouchStart);
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
        };
    }, [isMenuOpen, x, DRAWER_WIDTH]);

    return (
        <div className="relative flex-1 flex overflow-hidden">
            {/* Background Parallax Layer (Mobile Menu) */}
            <motion.div
                className="absolute inset-0 z-0 bg-white dark:bg-[#0a0a0a] md:hidden"
                style={{
                    x: bgX,
                }}
            >
                <MobileNavigationMenu />

                {/* Overlay oscuro para darle profundidad inicial, se va aclarando */}
                <motion.div
                    className="absolute inset-0 bg-black pointer-events-none"
                    style={{ opacity: bgOverlayOpacity }}
                />
            </motion.div>

            {/* Foreground Main Layer */}
            <motion.div
                className="flex-1 w-full bg-[var(--background)] flex relative z-10 md:shadow-none overflow-hidden"
                style={{
                    x,
                    boxShadow: foregroundShadow,
                }}
            >
                {/* Capa de intercepción: Si está abierto, no puedes usar la App, un tap lo cierra */}
                {isMenuOpen && (
                    <div
                        className="absolute inset-0 z-50 md:hidden bg-transparent"
                        onClick={() => {
                            setIsMenuOpen(false);
                            Haptics.impact({ style: ImpactStyle.Light }).catch(() => { });
                        }}
                    />
                )}

                {children}
            </motion.div>
        </div>
    )
}
