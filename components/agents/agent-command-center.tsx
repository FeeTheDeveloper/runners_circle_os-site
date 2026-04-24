"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import type { AgentTypeValue, BuiltAgentPrompt } from "@/lib/agents/types";
import type { AgentPromptListItem, AgentsWorkspaceSummary } from "@/lib/db/agents";
import type { DataSource } from "@/lib/db/runtime";

import { approveAgentPrompt, generateAgentPromptPreview } from "@/app/agents/actions";
import { agentRegistry, getAgentDefinition } from "@/lib/agents/agent-registry";
import { businessPresets, getBusinessPreset } from "@/lib/agents/business-presets";
import { getDefaultOutputPresetForAgent, getOutputPreset, listOutputPresetsForAgent } from "@/lib/agents/output-presets";
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

const defaultBusiness = getBusinessPreset("fee-the-developer") ?? businessPresets[0];
const defaultGoal = defaultBusiness?.defaultGoals[0] ?? "";
const defaultOutputPreset = getOutputPreset("content_pack_5_posts_2_videos") ?? getDefaultOutputPresetForAgent("content_creator");

const initialPreviewState: PreviewState = {
  status: "idle",
  preview: null
};

export function AgentCommandCenter({ campaigns, prompts, source, summary }: AgentCommandCenterProps) {
  const [selectedAgentType, setSelectedAgentType] = useState<AgentTypeValue>("content_creator");
  const [selectedBusinessSlug, setSelectedBusinessSlug] = useState(defaultBusiness?.slug ?? "");
  const [selectedGoalPreset, setSelectedGoalPreset] = useState(defaultGoal);
  const [goal, setGoal] = useState(defaultGoal);
  const [selectedOutputPresetKey, setSelectedOutputPresetKey] = useState(defaultOutputPreset?.key ?? "");
  const [previewState, previewAction] = useActionState(generateAgentPromptPreview, initialPreviewState);
  const [approveState, approveAction] = useActionState(approveAgentPrompt, initialActionState);

  const agentDefinition = getAgentDefinition(selectedAgentType) ?? agentRegistry[0];
  const selectedBusiness = getBusinessPreset(selectedBusinessSlug) ?? defaultBusiness;
  const availableOutputPresets = useMemo(() => listOutputPresetsForAgent(selectedAgentType), [selectedAgentType]);

  useEffect(() => {
    if (availableOutputPresets.some((preset) => preset.key === selectedOutputPresetKey)) {
      return;
    }

    setSelectedOutputPresetKey(availableOutputPresets[0]?.key ?? "");
  }, [availableOutputPresets, selectedOutputPresetKey]);

  useEffect(() => {
    const nextGoal = selectedBusiness?.defaultGoals[0] ?? "";

    setSelectedGoalPreset(nextGoal);
    setGoal(nextGoal);
  }, [selectedBusinessSlug, selectedBusiness]);

  const preview = previewState.preview ?? null;
  const payloadJson = useMemo(() => (preview ? JSON.stringify(preview.payload) : ""), [preview]);
  const selectedOutputPreset = getOutputPreset(selectedOutputPresetKey) ?? availableOutputPresets[0] ?? null;

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
                        <option key={agent.key} value={agent.key}>
                          {agent.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField error={previewState.fieldErrors?.businessSlug?.[0]} htmlFor="agent-business" label="Business">
                    <Select
                      id="agent-business"
                      name="businessSlug"
                      onChange={(event) => setSelectedBusinessSlug(event.currentTarget.value)}
                      value={selectedBusinessSlug}
                    >
                      {businessPresets.map((business) => (
                        <option key={business.slug} value={business.slug}>
                          {business.label}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField htmlFor="agent-goal-preset" label="Goal preset">
                    <Select
                      id="agent-goal-preset"
                      onChange={(event) => {
                        setSelectedGoalPreset(event.currentTarget.value);
                        setGoal(event.currentTarget.value);
                      }}
                      value={selectedGoalPreset}
                    >
                      {selectedBusiness?.defaultGoals.map((goalOption) => (
                        <option key={goalOption} value={goalOption}>
                          {goalOption}
                        </option>
                      ))}
                    </Select>
                  </FormField>

                  <FormField error={previewState.fieldErrors?.outputPresetKey?.[0]} htmlFor="agent-output-preset" label="Output">
                    <Select
                      id="agent-output-preset"
                      name="outputPresetKey"
                      onChange={(event) => setSelectedOutputPresetKey(event.currentTarget.value)}
                      value={selectedOutputPresetKey}
                    >
                      {availableOutputPresets.map((preset) => (
                        <option key={preset.key} value={preset.key}>
                          {preset.label}
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
                  <Textarea
                    id="agent-goal"
                    name="goal"
                    onChange={(event) => setGoal(event.currentTarget.value)}
                    placeholder={agentDefinition?.goalPlaceholder}
                    value={goal}
                  />
                </FormField>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-300">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="font-semibold text-white">{agentDefinition?.label}</p>
                      <p className="mt-1 leading-6 text-slate-400">{agentDefinition?.description}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{selectedBusiness?.label}</p>
                      <p className="mt-1 leading-6 text-slate-400">{selectedBusiness?.description}</p>
                      {selectedOutputPreset ? (
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{selectedOutputPreset.label}</p>
                      ) : null}
                    </div>
                  </div>
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
                      {prompts.map((prompt) => {
                        const promptAgent = getAgentDefinition(prompt.agentType as AgentTypeValue);
                        const promptBusiness = prompt.businessLabel
                          ? prompt.businessLabel
                          : getBusinessPreset(prompt.businessSlug ?? "runners-circle")?.label ?? formatTokenLabel(prompt.businessSlug ?? "unknown");

                        return (
                          <TableRow key={prompt.id}>
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-medium text-white">{prompt.title}</p>
                                <p className="text-xs text-slate-400">
                                  {promptAgent?.label ?? formatTokenLabel(prompt.agentType)}
                                </p>
                                <p className="text-xs text-slate-500">{promptBusiness}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={prompt.status} />
                            </TableCell>
                            <TableCell>{prompt.campaignName ?? "Unassigned"}</TableCell>
                            <TableCell>{prompt.outputLabel ?? formatTokenLabel(prompt.outputPresetKey ?? "general")}</TableCell>
                            <TableCell>{formatDateTime(prompt.createdAt)}</TableCell>
                          </TableRow>
                        );
                      })}
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
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Selected values</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      <p><span className="text-slate-500">Agent:</span> {getAgentDefinition(preview.payload.agentType)?.label ?? formatTokenLabel(preview.payload.agentType)}</p>
                      <p><span className="text-slate-500">Business:</span> {preview.payload.businessLabel}</p>
                      <p><span className="text-slate-500">Goal:</span> {preview.payload.goal}</p>
                      <p><span className="text-slate-500">Output:</span> {preview.payload.outputLabel}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Preset payload</p>
                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      <p><span className="text-slate-500">Posts:</span> {preview.payload.postCount ?? "n/a"}</p>
                      <p><span className="text-slate-500">Video scripts:</span> {preview.payload.videoScriptCount ?? "n/a"}</p>
                      <p><span className="text-slate-500">Captions:</span> {preview.payload.includeCaptions ? "Included" : "Optional"}</p>
                      <p><span className="text-slate-500">Image prompts:</span> {preview.payload.includeImagePrompts ? "Included" : "Optional"}</p>
                      <p><span className="text-slate-500">CTAs:</span> {preview.payload.includeCtas ? "Included" : "Optional"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5">
                  <p className="text-sm font-semibold text-slate-300">{agentDefinition?.previewLabel}</p>
                  <h3 className="mt-2 text-xl font-semibold text-white">{preview.title}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">{preview.prompt}</p>
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
                description="Generate a prompt from the left-hand form to review its selected presets, prompt body, payload, and recommended job type."
                title="No prompt preview yet"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
