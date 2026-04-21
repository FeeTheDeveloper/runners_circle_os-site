"use client";

import { useActionState, useEffect, useState } from "react";

import type { CreatorTemplateKey, CreatorRequestTypeValue } from "@/lib/creator/types";

import { createCreatorRequest } from "@/app/creator/actions";
import { brandKits } from "@/lib/creator/brand-kits";
import { creatorTemplates } from "@/lib/creator/template-registry";
import { initialActionState } from "@/lib/utils/action-state";
import { contentPlatformOptions } from "@/lib/utils/domain-options";
import { formatTokenLabel } from "@/lib/utils/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";

type CreatorRequestFormProps = {
  campaigns: Array<{
    id: string;
    name: string;
  }>;
};

export function CreatorRequestForm({ campaigns }: CreatorRequestFormProps) {
  const [state, formAction] = useActionState(createCreatorRequest, initialActionState);
  const [selectedType, setSelectedType] = useState<CreatorRequestTypeValue>("IMAGE");
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<CreatorTemplateKey>("image_offer_card");

  const availableTemplates = creatorTemplates.filter((template) => template.type === selectedType);
  const selectedTemplate =
    availableTemplates.find((template) => template.key === selectedTemplateKey) ?? availableTemplates[0];

  useEffect(() => {
    if (!availableTemplates.some((template) => template.key === selectedTemplateKey)) {
      setSelectedTemplateKey(availableTemplates[0]?.key ?? "image_offer_card");
    }
  }, [availableTemplates, selectedTemplateKey]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Queue creator request</CardTitle>
        <CardDescription>
          Submit code-driven image or video work that drops into the existing automation queue and asset registry.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form action={formAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.type?.[0]} htmlFor="creator-type" label="Request type">
              <Select
                id="creator-type"
                name="type"
                onChange={(event) => setSelectedType(event.currentTarget.value as CreatorRequestTypeValue)}
                value={selectedType}
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
              </Select>
            </FormField>

            <FormField error={state.fieldErrors?.templateKey?.[0]} htmlFor="creator-template" label="Template">
              <Select
                id="creator-template"
                name="templateKey"
                onChange={(event) => setSelectedTemplateKey(event.currentTarget.value as CreatorTemplateKey)}
                value={selectedTemplateKey}
              >
                {availableTemplates.map((template) => (
                  <option key={template.key} value={template.key}>
                    {template.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-4 text-sm text-slate-300">
            <p className="font-semibold text-white">{selectedTemplate?.label}</p>
            <p className="mt-1 leading-6 text-slate-400">{selectedTemplate?.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-500">
              {selectedTemplate?.aspectRatio} · {selectedTemplate?.dimensions.width}x{selectedTemplate?.dimensions.height}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.brandSlug?.[0]} htmlFor="creator-brand" label="Brand / business">
              <Select defaultValue={brandKits[0]?.slug} id="creator-brand" name="brandSlug">
                {brandKits.map((brand) => (
                  <option key={brand.slug} value={brand.slug}>
                    {brand.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField error={state.fieldErrors?.campaignId?.[0]} htmlFor="creator-campaign" label="Campaign">
              <Select defaultValue="none" id="creator-campaign" name="campaignId">
                <option value="none">No campaign link</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.platform?.[0]} htmlFor="creator-platform" label="Platform">
              <Select defaultValue="INSTAGRAM" id="creator-platform" name="platform">
                {contentPlatformOptions.map((platform) => (
                  <option key={platform} value={platform}>
                    {formatTokenLabel(platform)}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField error={state.fieldErrors?.format?.[0]} htmlFor="creator-format" label="Format">
              <Input
                defaultValue={selectedTemplate?.recommendedFormat}
                id="creator-format"
                key={selectedTemplate?.key ?? "creator-format"}
                name="format"
                placeholder="Vertical promo reel"
              />
            </FormField>
          </div>

          <FormField error={state.fieldErrors?.headline?.[0]} htmlFor="creator-headline" label="Headline">
            <Input id="creator-headline" name="headline" placeholder="Book your spring performance reset" />
          </FormField>

          <FormField error={state.fieldErrors?.body?.[0]} htmlFor="creator-body" label="Body">
            <Textarea
              id="creator-body"
              name="body"
              placeholder="Add the supporting message, offer framing, or teaser copy that powers the composition."
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField error={state.fieldErrors?.cta?.[0]} htmlFor="creator-cta" label="CTA">
              <Input id="creator-cta" name="cta" placeholder="Reserve your slot today" />
            </FormField>

            <FormField error={state.fieldErrors?.accentText?.[0]} htmlFor="creator-accent" label="Accent text">
              <Input id="creator-accent" name="accentText" placeholder="Limited drop" />
            </FormField>
          </div>

          <FormMessage state={state} />

          <SubmitButton pendingLabel="Queueing creator request...">Queue creator request</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
