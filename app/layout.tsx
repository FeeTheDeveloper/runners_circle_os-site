import type { Metadata } from "next";
import type { ReactNode } from "react";

import { getUser } from "@/lib/auth/session";

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

export default async function RootLayout({ children }: RootLayoutProps) {
  const user = await getUser();

  return (
    <html lang="en">
      <body data-authenticated={user ? "true" : "false"}>{children}</body>
    </html>
  );
}
