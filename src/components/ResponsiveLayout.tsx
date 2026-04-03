'use client'

import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import MobileNavigationMenu from './MobileNavigationMenu'

/**
 * ResponsiveLayout (Formerly DraggableLayout)
 * 
 * Optimized for a pure color-contrast separation (ChatGPT Style).
 * - Removed all shadows and transition overlays.
 * - Uses semantic background colors for clean separation.
 */
export default function ResponsiveLayout({ children }: { children: React.ReactNode }) {
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

    // Background Parallax: The menu slides behind the main content.
    const bgX = useTransform(x, [0, DRAWER_WIDTH], [-DRAWER_WIDTH * 0.4, 0])

    useEffect(() => {
        animate(x, isMenuOpen ? DRAWER_WIDTH : 0, {
            type: "spring",
            bounce: 0,
            duration: 0.35,
        });
    }, [isMenuOpen, x, DRAWER_WIDTH])

    // Listen for close-mobile-drawer event
    useEffect(() => {
        const handleClose = () => setIsMenuOpen(false);
        window.addEventListener('close-mobile-drawer', handleClose);
        return () => window.removeEventListener('close-mobile-drawer', handleClose);
    }, []);

    // Full Screen Swipe Gestures
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
                nextOpen = x.get() > DRAWER_WIDTH / 2;
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
            {/* Background Layer (Sidebar Menu) */}
            <motion.div
                className="absolute inset-0 z-0 bg-[var(--surface)] md:hidden"
                style={{ x: bgX }}
            >
                <MobileNavigationMenu />
            </motion.div>

            {/* Foreground Layer (Main Content) */}
            <motion.div
                className="flex-1 w-full bg-[var(--background)] flex relative z-10 shadow-none md:shadow-none overflow-hidden"
                style={{ x }}
            >
                {/* Interaction Intercepter */}
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
