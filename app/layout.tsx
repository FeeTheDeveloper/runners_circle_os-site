import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Runners Circle Marketing OS",
    template: "%s | Runners Circle Marketing OS"
  },
  description:
    "Operational workspace for campaign planning, publishing, audience management, lead workflows, and automations.",
  applicationName: "Runners Circle Marketing OS"
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
