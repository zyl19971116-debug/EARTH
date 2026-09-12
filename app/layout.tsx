import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "POINTS//FUN — Every Point Can Be a Coin",
  description: "Turn any point system and milestone into a community token.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
