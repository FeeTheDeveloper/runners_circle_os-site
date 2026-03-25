"use client";

import { useActionState, useEffect, useRef } from "react";

import { createContentItem } from "@/actions/content";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { initialActionState } from "@/lib/utils/action-state";
import { contentPlatformOptions, contentStatusOptions } from "@/lib/utils/domain-options";
import { formatTokenLabel } from "@/lib/utils/format";

type ContentCreateFormProps = {
  campaigns: Array<{
    id: string;
    name: string;
  }>;
};

export function ContentCreateForm({ campaigns }: ContentCreateFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createContentItem, initialActionState);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create content item</CardTitle>
        <CardDescription>
          Add scheduled content for social, lifecycle, and partner distribution workflows.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4" ref={formRef}>
          <FormField error={state.fieldErrors?.title?.[0]} htmlFor="content-title" label="Title">
            <Input id="content-title" name="title" placeholder="Event countdown reel" />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.platform?.[0]} htmlFor="content-platform" label="Platform">
              <Select defaultValue="INSTAGRAM" id="content-platform" name="platform">
                {contentPlatformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {formatTokenLabel(platform)}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField error={state.fieldErrors?.format?.[0]} htmlFor="content-format" label="Format">
              <Input id="content-format" name="format" placeholder="Reel, newsletter, carousel" />
            </FormField>
          </div>

          <FormField error={state.fieldErrors?.copy?.[0]} htmlFor="content-copy" label="Copy">
            <Textarea id="content-copy" name="copy" placeholder="Primary copy, CTA, or creative notes." />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.status?.[0]} htmlFor="content-status" label="Status">
              <Select defaultValue="DRAFT" id="content-status" name="status">
                {contentStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatTokenLabel(status)}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              error={state.fieldErrors?.scheduledFor?.[0]}
              htmlFor="content-scheduled-for"
              label="Scheduled for"
            >
              <Input id="content-scheduled-for" name="scheduledFor" type="datetime-local" />
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.campaignId?.[0]} htmlFor="content-campaign" label="Campaign">
              <Select defaultValue="none" id="content-campaign" name="campaignId">
                <option value="none">No campaign link</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField error={state.fieldErrors?.mediaUrl?.[0]} htmlFor="content-media-url" label="Media URL">
              <Input id="content-media-url" name="mediaUrl" placeholder="https://..." type="url" />
            </FormField>
          </div>

          <FormMessage state={state} />

          <SubmitButton pendingLabel="Creating content item...">Create content item</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
