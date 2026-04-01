import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Outfit, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ThemeHandler from "@/components/ThemeHandler";

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
      { url: "/Icon.png?v=7" },
      { url: "/Icon.png?v=7", sizes: "32x32", type: "image/png" },
      { url: "/Icon.png?v=7", sizes: "16x16", type: "image/png" },
    ],
    shortcut: ["/Icon.png?v=7"],
    apple: [
      { url: "/Icon.png?v=7", sizes: "180x180", type: "image/png" },
    ],
  },
  themeColor: "#0a0a0a",
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
                    console.log('DoReady Hydration v1.9 - No Time');
                    var path = window.location.pathname;
                    var isPublic = path === '/' || path.startsWith('/login');
                    
                    var t = localStorage.getItem('theme') || 'system';
                    var p = isPublic ? 'slate' : (localStorage.getItem('theme-preset') || 'slate');
                    var h = localStorage.getItem('theme-custom-hue') || '220';
                    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    
                    // SYSTEM COLOR SENSOR (No-Time)
                    var isDark = t === 'dark' || (t === 'system' && d);
                    
                    // Fallback for restricted WebViews (Check if system is dark via CanvasText)
                    if (t === 'system' && !isDark && typeof document !== 'undefined') {
                        var s = document.createElement('div');
                        s.style.color = 'CanvasText';
                        document.documentElement.appendChild(s);
                        var c = getComputedStyle(s).color;
                        document.documentElement.removeChild(s);
                        if (c.includes('255')) isDark = true;
                    }
                    
                    var doc = document.documentElement;
                    doc.classList.toggle('dark', isDark);
                    doc.classList.toggle('light', !isDark);
                    doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
                    
                    if (!isPublic && p === 'custom') {
                      doc.style.setProperty('--custom-hue', h);
                    }

                    // Clean and apply preset
                    doc.classList.remove('theme-blue', 'theme-slate', 'theme-purple', 'theme-green', 'theme-red', 'theme-orange', 'theme-yellow', 'theme-pink', 'theme-custom');
                    if (p !== 'slate') doc.classList.add('theme-' + p);
                  } catch (e) {}
                })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${outfit.variable} ${playfair.variable} antialiased select-none overflow-x-hidden`}
      >
        <ThemeHandler />
        <main className="min-h-screen pt-safe pb-safe">
          {children}
        </main>
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
