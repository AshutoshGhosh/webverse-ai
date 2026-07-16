import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { AppHeader } from "@/components/app-header";
import { CursorFollow } from "@/components/cursor-follow";
import { NoiseOverlay } from "@/components/noise-overlay";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "WebVerse — The AI Engineering Brain",
  description: "Transform any GitHub repository into a living engineering knowledge base.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <NoiseOverlay />
          <CursorFollow />
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
