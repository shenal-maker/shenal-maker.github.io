import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adele Shen",
  description:
    "Leyi (Adele) Shen — builder, researcher, storyteller.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
