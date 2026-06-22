import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers";

export const metadata: Metadata = {
  title: "DungeonHub – Campaign Dashboard",
  description: "Your D&D campaign companion. Track quests, battles, and glory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
