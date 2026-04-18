"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { initialActionState, type ActionState } from "@/lib/utils/action-state";
import { createClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters long."),
  redirectTo: z.string().optional()
});

function getRedirectTarget(rawRedirectTo?: string) {
  if (!rawRedirectTo || !rawRedirectTo.startsWith("/")) {
    return "/dashboard";
  }

  return rawRedirectTo;
}

function buildErrorState(message: string, fieldErrors?: ActionState["fieldErrors"]): ActionState {
  return {
    status: "error",
    message,
    fieldErrors
  };
}

export async function signIn(
  _previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo")
  });

  if (!parsed.success) {
    return buildErrorState("Enter a valid email and password to continue.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return buildErrorState(error.message);
  }

  revalidatePath("/", "layout");
  redirect(getRedirectTarget(parsed.data.redirectTo) as Parameters<typeof redirect>[0]);
}

export async function signUp(
  _previousState: ActionState = initialActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo")
  });

  if (!parsed.success) {
    return buildErrorState("Enter a valid email and password to create your account.", parsed.error.flatten().fieldErrors);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password
  });

  if (error) {
    return buildErrorState(error.message);
  }

  revalidatePath("/", "layout");

  if (data.session) {
    redirect(getRedirectTarget(parsed.data.redirectTo) as Parameters<typeof redirect>[0]);
  }

  redirect("/sign-in" as Parameters<typeof redirect>[0]);
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/sign-in");
}
