import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Certificate Automator",
  description: "An internal web-based workflow tool built for Innovation Growth Hub (IGHub) to automate the generation of student certificates in bulk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.className} h-full antialiased tracking-tighter`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
