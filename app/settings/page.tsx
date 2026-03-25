import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { AUTH_MIDDLEWARE_ENABLED } from "@/lib/auth/config";
import { getAwsRuntimeConfig } from "@/lib/aws/config";

const envHealth = [
  {
    label: "Database",
    status: process.env.DATABASE_URL ? "Configured" : "Missing",
    detail: "PostgreSQL connection string for Prisma runtime and migrations."
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
              <CardTitle>Auth middleware</CardTitle>
              <CardDescription>
                Middleware is structured for future session gating without blocking shell review during setup.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-300">Current state</span>
                <Badge variant={AUTH_MIDDLEWARE_ENABLED ? "success" : "warning"}>
                  {AUTH_MIDDLEWARE_ENABLED ? "Enabled" : "Preview mode"}
                </Badge>
              </div>
              <p className="text-sm leading-6 text-slate-400">
                Turn on <code className="font-mono text-slate-200">AUTH_MIDDLEWARE_ENABLED=true</code> after session
                issuance and sign-in handling are connected.
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
