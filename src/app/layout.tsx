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
                    var p = localStorage.getItem('theme-preset') || 'slate';
                    var h = localStorage.getItem('theme-custom-hue') || '220';
                    var isDark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    
                    var doc = document.documentElement;
                    doc.classList.add(isDark ? 'dark' : 'light');
                    doc.style.setProperty('color-scheme', isDark ? 'dark' : 'light');
                    
                    if (p !== 'slate') doc.classList.add('theme-' + p);
                    if (p === 'custom') doc.style.setProperty('--custom-hue', h);
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
