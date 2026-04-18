"use client";

import { signOut } from "@/app/(auth)/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export function SignOutForm() {
  return (
    <form action={signOut}>
      <SubmitButton pendingLabel="Signing out..." variant="secondary">
        Sign out
      </SubmitButton>
    </form>
  );
}
