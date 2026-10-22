import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClassLens AI",
  description: "Evidence-based class quality evaluation.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
