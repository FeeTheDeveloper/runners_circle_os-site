"use client";

import { useActionState, useEffect, useRef } from "react";

import { createCampaign } from "@/actions/campaigns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils/action-state";
import { campaignStatusOptions } from "@/lib/utils/domain-options";
import { formatTokenLabel } from "@/lib/utils/format";

export function CampaignCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createCampaign, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create campaign</CardTitle>
        <CardDescription>
          Add the next marketing motion with objective, lifecycle status, and planned dates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" ref={formRef}>
          <FormField error={state.fieldErrors?.name?.[0]} htmlFor="campaign-name" label="Campaign name">
            <Input id="campaign-name" name="name" placeholder="Spring runner reactivation" />
          </FormField>

          <FormField
            error={state.fieldErrors?.objective?.[0]}
            htmlFor="campaign-objective"
            label="Objective"
          >
            <Textarea
              id="campaign-objective"
              name="objective"
              placeholder="Describe the primary business outcome and channel intent."
            />
          </FormField>

          <FormField
            error={state.fieldErrors?.description?.[0]}
            htmlFor="campaign-description"
            label="Description"
          >
            <Textarea
              id="campaign-description"
              name="description"
              placeholder="Add planning context, offer details, or operational notes for the team."
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField error={state.fieldErrors?.status?.[0]} htmlFor="campaign-status" label="Status">
              <Select defaultValue="DRAFT" id="campaign-status" name="status">
                {campaignStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatTokenLabel(status)}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField error={state.fieldErrors?.startDate?.[0]} htmlFor="campaign-start-date" label="Start date">
              <Input id="campaign-start-date" name="startDate" type="date" />
            </FormField>

            <FormField error={state.fieldErrors?.endDate?.[0]} htmlFor="campaign-end-date" label="End date">
              <Input id="campaign-end-date" name="endDate" type="date" />
            </FormField>
          </div>

          <FormMessage state={state} />

          <SubmitButton pendingLabel="Creating campaign...">Create campaign</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
