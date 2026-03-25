"use client";

import { useActionState, useEffect, useRef } from "react";

import { createLead } from "@/actions/leads";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils/action-state";
import { leadStatusOptions } from "@/lib/utils/domain-options";
import { formatTokenLabel } from "@/lib/utils/format";

type LeadCreateFormProps = {
  segments: Array<{
    id: string;
    name: string;
  }>;
};

export function LeadCreateForm({ segments }: LeadCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createLead, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create lead</CardTitle>
        <CardDescription>
          Add new contacts into the operating system for nurture, qualification, and pipeline routing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" ref={formRef}>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.firstName?.[0]} htmlFor="lead-first-name" label="First name">
              <Input id="lead-first-name" name="firstName" placeholder="Taylor" />
            </FormField>

            <FormField error={state.fieldErrors?.lastName?.[0]} htmlFor="lead-last-name" label="Last name">
              <Input id="lead-last-name" name="lastName" placeholder="Brooks" />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.email?.[0]} htmlFor="lead-email" label="Email">
              <Input id="lead-email" name="email" placeholder="name@company.com" type="email" />
            </FormField>

            <FormField error={state.fieldErrors?.status?.[0]} htmlFor="lead-status" label="Status">
              <Select defaultValue="NEW" id="lead-status" name="status">
                {leadStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatTokenLabel(status)}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.company?.[0]} htmlFor="lead-company" label="Company">
              <Input id="lead-company" name="company" placeholder="FleetForm" />
            </FormField>

            <FormField error={state.fieldErrors?.source?.[0]} htmlFor="lead-source" label="Source">
              <Input id="lead-source" name="source" placeholder="Partner referral, outbound, event" />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.segmentId?.[0]} htmlFor="lead-segment" label="Segment">
              <Select defaultValue="none" id="lead-segment" name="segmentId">
                <option value="none">No segment</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField error={state.fieldErrors?.tags?.[0]} htmlFor="lead-tags" hint="Comma separated" label="Tags">
              <Input id="lead-tags" name="tags" placeholder="partner, outbound, warm" />
            </FormField>
          </div>

          <FormField error={state.fieldErrors?.notes?.[0]} htmlFor="lead-notes" label="Notes">
            <Textarea id="lead-notes" name="notes" placeholder="Deal context, follow-up notes, or qualification summary." />
          </FormField>

          <FormMessage state={state} />

          <SubmitButton pendingLabel="Creating lead...">Create lead</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
