"use client";

import { useActionState, useEffect, useRef } from "react";

import { createAudienceSegment } from "@/actions/audiences";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils/action-state";

export function AudienceCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createAudienceSegment, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create audience segment</CardTitle>
        <CardDescription>
          Define market lanes and reusable tags for personalization, targeting, and lead routing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" ref={formRef}>
          <FormField error={state.fieldErrors?.name?.[0]} htmlFor="audience-name" label="Segment name">
            <Input id="audience-name" name="name" placeholder="Trail runners - high intent" />
          </FormField>

          <FormField error={state.fieldErrors?.marketLane?.[0]} htmlFor="audience-market-lane" label="Market lane">
            <Input id="audience-market-lane" name="marketLane" placeholder="Performance, lifecycle, B2B growth" />
          </FormField>

          <FormField error={state.fieldErrors?.tags?.[0]} htmlFor="audience-tags" hint="Comma separated" label="Tags">
            <Input id="audience-tags" name="tags" placeholder="warm, partner, paid-social" />
          </FormField>

          <FormField
            error={state.fieldErrors?.description?.[0]}
            htmlFor="audience-description"
            label="Description"
          >
            <Textarea
              id="audience-description"
              name="description"
              placeholder="Outline the segment intent, trigger logic, or downstream usage."
            />
          </FormField>

          <FormMessage state={state} />

          <SubmitButton pendingLabel="Creating audience segment...">Create audience segment</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
