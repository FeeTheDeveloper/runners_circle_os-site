import type { ReactNode } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { TopHeader } from "@/components/layout/top-header";
import { getUser } from "@/lib/auth/session";

type AppShellProps = {
  children: ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const user = await getUser();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        <Sidebar />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopHeader user={user} />
          <main className="flex-1 px-6 pb-8 pt-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
