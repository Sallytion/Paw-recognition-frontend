import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paw Recognition - Dog Breed Predictor",
  description: "AI-powered dog breed identification using machine learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
