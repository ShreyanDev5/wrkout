import type React from "react";
import "../globals.css";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import DemoDataLoader from "@/components/auth/demo-data-loader";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <DemoDataLoader>
            <ThemeProvider>{children}</ThemeProvider>
          </DemoDataLoader>
        </AuthProvider>
      </body>
    </html>
  );
} 