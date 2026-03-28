import {
  badgeVariantStyles,
  bannerVariantStyles,
  buttonVariantStyles,
  textStyles,
} from "@/lib/model/defaults";
import type { PaletteItemType } from "@/lib/model/document";

export type ComponentPresetId =
  | "primaryCta"
  | "secondaryCta"
  | "accentCta"
  | "searchField"
  | "deliveryField"
  | "successBadge"
  | "statusBadge"
  | "infoBanner"
  | "warningBanner"
  | "agreementCheckbox"
  | "deliverySegment";

export type ComponentPresetDefinition = {
  id: ComponentPresetId;
  label: string;
  description: string;
  type: PaletteItemType;
  patch: Record<string, unknown>;
};

export const componentPresetItems: ComponentPresetDefinition[] = [
  {
    id: "primaryCta",
    label: "Primary CTA",
    description: "Success-styled main action button",
    type: "button",
    patch: {
      text: "Continue",
      variant: "primarySuccess",
      fillColor: buttonVariantStyles.primarySuccess.fillColor,
      strokeColor: buttonVariantStyles.primarySuccess.strokeColor,
      textStyle: {
        ...textStyles.cta,
        color: buttonVariantStyles.primarySuccess.textColor,
      },
    },
  },
  {
    id: "secondaryCta",
    label: "Secondary CTA",
    description: "Neutral outline secondary action",
    type: "button",
    patch: {
      text: "Back",
      variant: "secondaryOutline",
      fillColor: buttonVariantStyles.secondaryOutline.fillColor,
      strokeColor: buttonVariantStyles.secondaryOutline.strokeColor,
      textStyle: {
        ...textStyles.cta,
        color: buttonVariantStyles.secondaryOutline.textColor,
      },
    },
  },
  {
    id: "accentCta",
    label: "Accent CTA",
    description: "Accent outline action for links or details",
    type: "button",
    patch: {
      text: "More details",
      variant: "accentOutline",
      fillColor: buttonVariantStyles.accentOutline.fillColor,
      strokeColor: buttonVariantStyles.accentOutline.strokeColor,
      textStyle: {
        ...textStyles.cta,
        color: buttonVariantStyles.accentOutline.textColor,
      },
    },
  },
  {
    id: "searchField",
    label: "Search field",
    description: "Compact field preset for search/filter rows",
    type: "field",
    patch: {
      label: "Search",
      value: "Type a request",
    },
  },
  {
    id: "deliveryField",
    label: "Delivery field",
    description: "Field preset for address or pickup point",
    type: "field",
    patch: {
      label: "Pickup point",
      value: "Main st. 24, Yekaterinburg",
      width: 320,
    },
  },
  {
    id: "successBadge",
    label: "Success badge",
    description: "Positive status chip",
    type: "badge",
    patch: {
      text: "Verified",
      variant: "success",
      fillColor: badgeVariantStyles.success.fillColor,
      strokeColor: badgeVariantStyles.success.strokeColor,
      textStyle: {
        ...textStyles.bodyStrong,
        fontSize: 10,
        align: "center",
        color: badgeVariantStyles.success.textColor,
      },
    },
  },
  {
    id: "statusBadge",
    label: "Status badge",
    description: "Pending or review state chip",
    type: "badge",
    patch: {
      text: "Pending",
      variant: "status",
      fillColor: badgeVariantStyles.status.fillColor,
      strokeColor: badgeVariantStyles.status.strokeColor,
      textStyle: {
        ...textStyles.bodyStrong,
        fontSize: 10,
        align: "center",
        color: badgeVariantStyles.status.textColor,
      },
    },
  },
  {
    id: "infoBanner",
    label: "Info banner",
    description: "Soft informational notice block",
    type: "banner",
    patch: {
      title: "Online consultation",
      body: "The doctor will call within the selected time slot.",
      variant: "info",
      fillColor: bannerVariantStyles.info.fillColor,
      strokeColor: bannerVariantStyles.info.strokeColor,
    },
  },
  {
    id: "warningBanner",
    label: "Warning banner",
    description: "Warning message for blockers or risks",
    type: "banner",
    patch: {
      title: "Check your documents",
      body: "Bring your passport and insurance card to the appointment.",
      variant: "warning",
      fillColor: bannerVariantStyles.warning.fillColor,
      strokeColor: bannerVariantStyles.warning.strokeColor,
    },
  },
  {
    id: "agreementCheckbox",
    label: "Agreement row",
    description: "Checkbox row for consent or confirmation",
    type: "checkbox",
    patch: {
      text: "I agree with the terms and privacy policy",
      width: 260,
    },
  },
  {
    id: "deliverySegment",
    label: "Delivery segmented",
    description: "Preset switch between delivery and pickup",
    type: "segmentedControl",
    patch: {
      items: ["Delivery", "Pickup"],
      width: 260,
    },
  },
];
