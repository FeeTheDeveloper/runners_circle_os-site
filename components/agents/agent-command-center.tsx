"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import type { AgentTypeValue, BuiltAgentPrompt } from "@/lib/agents/types";
import type { AgentPromptListItem, AgentsWorkspaceSummary } from "@/lib/db/agents";
import type { DataSource } from "@/lib/db/runtime";

import { approveAgentPrompt, generateAgentPromptPreview } from "@/app/agents/actions";
import { agentRegistry, getAgentDefinition } from "@/lib/agents/agent-registry";
import { brandKits, getBrandKit } from "@/lib/creator/brand-kits";
import { initialActionState } from "@/lib/utils/action-state";
import { contentPlatformOptions } from "@/lib/utils/domain-options";
import { formatDateTime, formatTokenLabel } from "@/lib/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataSourceBadge } from "@/components/ui/data-source-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Select } from "@/components/ui/select";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrapper
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type AgentCommandCenterProps = {
  campaigns: Array<{
    id: string;
    name: string;
  }>;
  prompts: AgentPromptListItem[];
  source: DataSource;
  summary: AgentsWorkspaceSummary;
};

type PreviewState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  preview?: BuiltAgentPrompt | null;
};

const initialPreviewState: PreviewState = {
  status: "idle",
  preview: null
};

export function AgentCommandCenter({ campaigns, prompts, source, summary }: AgentCommandCenterProps) {
  const [selectedAgentType, setSelectedAgentType] = useState<AgentTypeValue>("campaign_builder");
  const agentDefinition = getAgentDefinition(selectedAgentType) ?? agentRegistry[0];
  const [selectedOutputType, setSelectedOutputType] = useState(agentDefinition.defaultOutputType);
  const [previewState, previewAction] = useActionState(generateAgentPromptPreview, initialPreviewState);
  const [approveState, approveAction] = useActionState(approveAgentPrompt, initialActionState);

  useEffect(() => {
    setSelectedOutputType(agentDefinition.defaultOutputType);
  }, [agentDefinition.defaultOutputType]);

  const preview = previewState.preview ?? null;
  const payloadJson = useMemo(() => (preview ? JSON.stringify(preview.payload) : ""), [preview]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard description="Agent prompts created in the command center." label="Prompts" value={String(summary.totalPrompts)} />
        <StatCard
          description="Prompts waiting for queue pickup or manual execution."
          label="Queued"
          tone="warning"
          value={String(summary.queuedPrompts)}
        />
        <StatCard
          description="Prompts already processed through the automation layer."
          label="Completed"
          tone="success"
          value={String(summary.completedPrompts)}
        />
        <StatCard
          description="Prompt jobs that ended in a terminal failure state."
          label="Failed"
          tone="danger"
          value={String(summary.failedPrompts)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prompt generator</CardTitle>
              <CardDescription>
                Turn a business goal into a structured agent prompt, then approve it into the AutomationJob queue.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <form action={previewAction} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField error={previewState.fieldErrors?.agentType?.[0]} htmlFor="agent-type" label="Agent">
                    <Select
                      id="agent-type"
                      name="agentType"
                      onChange={(event) => setSelectedAgentType(event.currentTarget.value as AgentTypeValue)}
                      value={selectedAgentType}
                    >
                      {agentRegistry.map((agent) => (
                        <option key={agent.type} value={agent.type}>
                          {agent.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField error={previewState.fieldErrors?.brandSlug?.[0]} htmlFor="agent-brand" label="Brand / business">
                    <Select defaultValue={brandKits[0]?.slug} id="agent-brand" name="brandSlug">
                      {brandKits.map((brand) => (
                        <option key={brand.slug} value={brand.slug}>
                          {brand.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField error={previewState.fieldErrors?.campaignId?.[0]} htmlFor="agent-campaign" label="Campaign">
                    <Select defaultValue="none" id="agent-campaign" name="campaignId">
                      <option value="none">No campaign link</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.id} value={campaign.id}>
                          {campaign.name}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField error={previewState.fieldErrors?.platform?.[0]} htmlFor="agent-platform" label="Platform">
                    <Select defaultValue="none" id="agent-platform" name="platform">
                      <option value="none">No platform constraint</option>
                      {contentPlatformOptions.map((platform) => (
                        <option key={platform} value={platform}>
                          {formatTokenLabel(platform)}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <FormField error={previewState.fieldErrors?.goal?.[0]} htmlFor="agent-goal" label="Goal">
                  <Textarea id="agent-goal" name="goal" placeholder={agentDefinition.goalPlaceholder} />
                </FormField>

                <FormField error={previewState.fieldErrors?.outputType?.[0]} htmlFor="agent-output-type" label="Output type">
                  <Select
                    id="agent-output-type"
                    name="outputType"
                    onChange={(event) => setSelectedOutputType(event.currentTarget.value)}
                    value={selectedOutputType}
                  >
                    {agentDefinition.outputTypes.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <p className="font-semibold text-white">{agentDefinition.label}</p>
                  <p className="mt-1 leading-6 text-slate-400">{agentDefinition.description}</p>
                </div>

                <FormMessage state={previewState} />

                <SubmitButton pendingLabel="Generating prompt...">Generate prompt</SubmitButton>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle>Approved prompt ledger</CardTitle>
                  <CardDescription>
                    Saved agent prompts stay attached to campaigns and queue into the same execution system as the rest of the OS.
                  </CardDescription>
                </div>
                <DataSourceBadge source={source} />
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {prompts.length > 0 ? (
                <TableWrapper>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Output</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {prompts.map((prompt) => (
                        <TableRow key={prompt.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium text-white">{prompt.title}</p>
                              <p className="text-xs text-slate-400">
                                {getAgentDefinition(prompt.agentType as AgentTypeValue)?.label ?? formatTokenLabel(prompt.agentType)}
                              </p>
                              <p className="text-xs text-slate-500">{getBrandKit(prompt.brandSlug ?? "runners-circle").label}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={prompt.status} />
                          </TableCell>
                          <TableCell>{prompt.campaignName ?? "Unassigned"}</TableCell>
                          <TableCell>{prompt.outputType ? formatTokenLabel(prompt.outputType) : "General"}</TableCell>
                          <TableCell>{formatDateTime(prompt.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableWrapper>
              ) : (
                <EmptyState
                  description="Approved prompts will appear here once you generate and queue the first agent job."
                  title="No agent prompts approved yet"
                />
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Prompt preview</CardTitle>
            <CardDescription>
              Review the generated instructions before approving them into the queue-backed execution layer.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {preview ? (
              <>
                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5">
                  <p className="text-sm font-semibold text-slate-300">{agentDefinition.previewLabel}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{preview.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400 whitespace-pre-wrap">{preview.prompt}</p>
                </div>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5">
                  <p className="text-sm font-semibold text-slate-300">Payload preview</p>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-400">
                    {JSON.stringify(preview.payload, null, 2)}
                  </pre>
                </div>

                <form action={approveAction} className="space-y-4">
                  <input name="agentType" type="hidden" value={preview.payload.agentType} />
                  <input name="campaignId" type="hidden" value={preview.payload.campaignId ?? "none"} />
                  <input name="contentId" type="hidden" value={preview.payload.contentId ?? "none"} />
                  <input name="title" type="hidden" value={preview.title} />
                  <input name="prompt" type="hidden" value={preview.prompt} />
                  <input name="payloadJson" type="hidden" value={payloadJson} />
                  <input name="recommendedJobType" type="hidden" value={preview.recommendedJobType} />

                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-300">
                    <p className="font-semibold text-white">Recommended job type</p>
                    <p className="mt-1">{formatTokenLabel(preview.recommendedJobType)}</p>
                  </div>

                  <FormMessage state={approveState} />

                  <SubmitButton pendingLabel="Creating automation job...">Approve / create job</SubmitButton>
                </form>
              </>
            ) : (
              <EmptyState
                description="Generate a prompt from the left-hand form to review its title, prompt body, payload, and recommended job type."
                title="No prompt preview yet"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
