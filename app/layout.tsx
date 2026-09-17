import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EARTH ONLINE — The City Token Launchpad",
  description: "Launch, discover and trade community-owned city tokens.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/earth-token.png",
    shortcut: "/earth-token.png",
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
