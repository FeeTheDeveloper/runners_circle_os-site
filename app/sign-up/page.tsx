import { AuthForm } from "@/components/auth/auth-form";
import { getSearchParamValue } from "@/lib/utils/search-params";

type SignUpPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = (await searchParams) ?? {};

  return <AuthForm mode="sign-up" redirectTo={getSearchParamValue(params.redirectTo)} />;
}
