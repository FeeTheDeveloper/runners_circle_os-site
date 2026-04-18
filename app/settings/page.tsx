import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { getAwsRuntimeConfig } from "@/lib/aws/config";

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

const envHealth = [
  {
    label: "Database",
    status: process.env.DATABASE_URL ? "Configured" : "Missing",
    detail: "PostgreSQL connection string for Prisma runtime and migrations."
  },
  {
    label: "Supabase Auth",
    status: supabaseConfigured ? "Configured" : "Missing",
    detail: "URL and publishable key used for SSR-safe auth clients and protected routes."
  },
  {
    label: "CRM",
    status: process.env.CRM_API_KEY ? "Configured" : "Missing",
    detail: "Reserved for CRM pull/push flows and webhook verification."
  },
  {
    label: "Social",
    status: process.env.SOCIAL_API_KEY ? "Configured" : "Missing",
    detail: "Reserved for content publishing and account health checks."
  }
];

export default function SettingsPage() {
  const aws = getAwsRuntimeConfig();

  return (
    <AppShell>
      <PageHeader
        description="Environment health, auth posture, and integration readiness for the internal marketing operating system."
        eyebrow="Platform"
        title="Settings"
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card>
          <CardHeader>
            <CardTitle>Environment readiness</CardTitle>
            <CardDescription>
              Secrets and infrastructure placeholders are organized for Prisma, CRM, social, and AWS expansion.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {envHealth.map((item) => (
              <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4" key={item.label}>
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                  <Badge variant={item.status === "Configured" ? "success" : "warning"}>{item.status}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{item.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Auth protection</CardTitle>
              <CardDescription>
                Middleware now refreshes Supabase sessions and blocks private routes until a valid user is present.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-300">Current state</span>
                <Badge variant={supabaseConfigured ? "success" : "warning"}>
                  {supabaseConfigured ? "Protected" : "Awaiting config"}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Set <code className="font-mono text-slate-200">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                <code className="font-mono text-slate-200">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> to enable the
                full sign-in, session refresh, and logout flow.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AWS integration staging</CardTitle>
              <CardDescription>
                Configuration helpers are ready for asset storage, job fan-out, and infrastructure hooks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center justify-between gap-3">
                <span>Region</span>
                <span className="text-slate-100">{aws.region || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>S3 Bucket</span>
                <span className="text-slate-100">{aws.bucket || "Not set"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>CloudFront Distribution</span>
                <span className="text-slate-100">{aws.mediaDistributionId || "Not set"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
