// Root layout wiring providers and shell spacing.
import type { Metadata } from "next";
import "./globals.css";
import { AppBootstrap } from "@/providers/AppBootstrap";
import { ThemeProvider } from "@/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "Exit Window",
  description: "Private, offline-first instrument built to stay on your device.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-50">
        <ThemeProvider>
          <AppBootstrap />
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8 md:py-12">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
