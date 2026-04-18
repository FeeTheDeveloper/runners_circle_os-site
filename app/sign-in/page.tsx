import { AuthForm } from "@/components/auth/auth-form";
import { getSearchParamValue } from "@/lib/utils/search-params";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <AuthForm
      message={getSearchParamValue(params.message)}
      mode="sign-in"
      redirectTo={getSearchParamValue(params.redirectTo)}
    />
  );
}
