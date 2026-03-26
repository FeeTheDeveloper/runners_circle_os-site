"use client";

import type { CampaignStatus } from "@prisma/client";
import { Fragment, useActionState, useEffect, useState } from "react";

import { deleteCampaign, updateCampaign } from "@/actions/campaigns";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormField } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
import { initialActionState } from "@/lib/utils/action-state";
import { campaignStatusOptions } from "@/lib/utils/domain-options";
import { formatTokenLabel } from "@/lib/utils/format";

export type CampaignRegistryItem = {
  id: string;
  name: string;
  objective: string;
  description: string | null;
  status: CampaignStatus;
  startDateLabel: string;
  endDateLabel: string;
  createdAtLabel: string;
  startDateValue: string;
  endDateValue: string;
  createdByName: string | null;
  contentItemsCount: number;
};

type CampaignRegistryProps = {
  items: CampaignRegistryItem[];
};

export function CampaignRegistry({ items }: CampaignRegistryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <EmptyState
        description="No campaigns are stored yet. Create the first campaign to begin planning execution inside the operating system."
        title="No campaigns yet"
      />
    );
  }

  return (
    <TableWrapper>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Campaign</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>End</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((campaign) => {
            const isEditing = editingId === campaign.id;

            return (
              <Fragment key={campaign.id}>
                <TableRow>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-white">{campaign.name}</p>
                      <p className="max-w-lg text-sm leading-6 text-slate-400">{campaign.objective}</p>
                      {campaign.description ? (
                        <p className="max-w-lg text-xs leading-5 text-slate-500">{campaign.description}</p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={campaign.status} />
                  </TableCell>
                  <TableCell>{campaign.startDateLabel}</TableCell>
                  <TableCell>{campaign.endDateLabel}</TableCell>
                  <TableCell>{campaign.createdByName ?? "System"}</TableCell>
                  <TableCell>{String(campaign.contentItemsCount)}</TableCell>
                  <TableCell>{campaign.createdAtLabel}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => setEditingId(isEditing ? null : campaign.id)} variant="ghost">
                        {isEditing ? "Close" : "Edit"}
                      </Button>
                      <CampaignDeleteForm id={campaign.id} name={campaign.name} />
                    </div>
                  </TableCell>
                </TableRow>
                {isEditing ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="bg-slate-950/30" colSpan={8}>
                      <CampaignUpdateForm campaign={campaign} onClose={() => setEditingId(null)} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
}

function CampaignUpdateForm({
  campaign,
  onClose
}: {
  campaign: CampaignRegistryItem;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(updateCampaign, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      onClose();
    }
  }, [onClose, state.status]);

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-100">Edit campaign</p>
          <p className="text-sm text-slate-400">
            Update the campaign details, lifecycle status, or timeline without leaving the registry.
          </p>
        </div>
        <Button onClick={onClose} variant="ghost">
          Cancel
        </Button>
      </div>

      <form action={formAction} className="space-y-4">
        <input name="id" type="hidden" value={campaign.id} />

        <div className="grid gap-4 xl:grid-cols-[1.1fr,1.2fr]">
          <FormField error={state.fieldErrors?.name?.[0]} htmlFor={`campaign-name-${campaign.id}`} label="Campaign name">
            <Input defaultValue={campaign.name} id={`campaign-name-${campaign.id}`} name="name" />
          </FormField>

          <FormField
            error={state.fieldErrors?.status?.[0]}
            htmlFor={`campaign-status-${campaign.id}`}
            label="Status"
          >
            <Select defaultValue={campaign.status} id={`campaign-status-${campaign.id}`} name="status">
              {campaignStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {formatTokenLabel(status)}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField
          error={state.fieldErrors?.objective?.[0]}
          htmlFor={`campaign-objective-${campaign.id}`}
          label="Objective"
        >
          <Textarea defaultValue={campaign.objective} id={`campaign-objective-${campaign.id}`} name="objective" />
        </FormField>

        <FormField
          error={state.fieldErrors?.description?.[0]}
          htmlFor={`campaign-description-${campaign.id}`}
          label="Description"
        >
          <Textarea
            defaultValue={campaign.description ?? ""}
            id={`campaign-description-${campaign.id}`}
            name="description"
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            error={state.fieldErrors?.startDate?.[0]}
            htmlFor={`campaign-start-date-${campaign.id}`}
            label="Start date"
          >
            <Input
              defaultValue={campaign.startDateValue}
              id={`campaign-start-date-${campaign.id}`}
              name="startDate"
              type="date"
            />
          </FormField>

          <FormField
            error={state.fieldErrors?.endDate?.[0]}
            htmlFor={`campaign-end-date-${campaign.id}`}
            label="End date"
          >
            <Input
              defaultValue={campaign.endDateValue}
              id={`campaign-end-date-${campaign.id}`}
              name="endDate"
              type="date"
            />
          </FormField>
        </div>

        <FormMessage state={state} />

        <div className="flex flex-wrap gap-3">
          <SubmitButton pendingLabel="Saving changes...">Save changes</SubmitButton>
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

function CampaignDeleteForm({ id, name }: { id: string; name: string }) {
  const [state, formAction] = useActionState(deleteCampaign, initialActionState);

  return (
    <div className="space-y-2">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete "${name}"? Linked content items will keep their records and lose the campaign link.`)) {
            event.preventDefault();
          }
        }}
      >
        <input name="id" type="hidden" value={id} />
        <SubmitButton
          className="border-rose-500/30 bg-rose-500/10 text-rose-100 hover:border-rose-400/50 hover:bg-rose-500/20"
          pendingLabel="Deleting..."
        >
          Delete
        </SubmitButton>
      </form>
      {state.status === "error" && state.message ? (
        <p className="max-w-56 text-xs leading-5 text-rose-300">{state.message}</p>
      ) : null}
    </div>
  );
}
