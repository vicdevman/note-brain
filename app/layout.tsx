import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Brane - Smart Note Taking App",
  description: "A modern, intuitive note-taking application with powerful organization features. Create, edit, and manage your notes with ease.",
  keywords: "notes, note-taking, organizer, productivity, markdown, editor",
  authors: [{ name: "Brane Team" }],
  openGraph: {
    title: "Brane - Smart Note Taking App",
    description: "A modern, intuitive note-taking application with powerful organization features.",
    type: "website",
    url: "https://brane.app",
    images: [
      {
        url: "https://brane.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Brane App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brane - Smart Note Taking App",
    description: "A modern, intuitive note-taking application with powerful organization features.",
    images: ["https://brane.app/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", inter.variable)}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
