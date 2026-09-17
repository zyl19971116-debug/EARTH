import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.earthonline.today"),
  title: "EARTH ONLINE — The City Token Launchpad",
  description: "Launch, discover and trade community-owned city tokens.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/earth-token.png",
    shortcut: "/earth-token.png",
    apple: "/earth-token.png",
  },
  openGraph: {
    title: "EARTH ONLINE — The City Token Launchpad",
    description: "Launch, discover and trade community-owned city tokens.",
    images: ["/earth-online-brand.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/earth-online-brand.png"],
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
