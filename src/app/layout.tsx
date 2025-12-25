
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "./components/ConditionalLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Mock Interview Platform",
  description: "Practice interviews with AI-generated questions and real-time feedback",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className + " overflow-x-hidden"}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
