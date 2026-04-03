import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ThemeHandler from "@/components/ThemeHandler";
import OfflineOverlay from "@/components/OfflineOverlay";
import StartupLoader from "@/components/StartupLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoReady | Focus & Consistency",
  description: "Your daily action core. Track your focus and build consistency.",
  manifest: "/manifest.json?v=11",
  icons: {
    icon: [
      { url: "/icon.png?v=7" },
      { url: "/icon.png?v=7", sizes: "32x32", type: "image/png" },
      { url: "/icon.png?v=7", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/icon.png?v=7"],
    apple: [
      { url: "/icon.png?v=7", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    title: "DoReady",
    statusBarStyle: "black-translucent",
  }
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                (function() {
                  try {
                    var t = localStorage.getItem('theme') || 'system';
                    var doc = document.documentElement;
                    var apply = function() {
                      var isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                      doc.classList.remove('light', 'dark');
                      doc.classList.add(isDark ? 'dark' : 'light');
                      doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
                      // No longer using presets (chromatic accents)
                    };
                    apply();
                    setTimeout(apply, 0);
                  } catch (e) {}
                })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #startup-static-overlay {
                position: fixed;
                inset: 0;
                z-index: 9998;
                background-color: #000000;
                display: flex;
                align-items: center;
                justify-content: center;
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${playfair.variable} antialiased select-none fixed inset-0 w-full h-[100dvh] overflow-hidden overscroll-none`}
      >
        <div id="startup-static-overlay" />
        <ThemeHandler />
        <StartupLoader />
        <OfflineOverlay />
        <main className="h-full w-full relative pt-safe pb-safe">
          {children}
        </main>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
