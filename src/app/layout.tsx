import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finanzplan – Einnahmen, Ausgaben & Sparziele planen",
  description:
    "Plane deine monatlichen Einnahmen und Ausgaben und verfolge deine Sparziele – clean, einfach, wie ein Spreadsheet, das mitdenkt.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
