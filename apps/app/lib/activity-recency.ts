import { translator } from "@crm/i18n/translator";

const DAYS = ["7", "30", "90"] as const;

export const ACTIVITY_FACET_OPTIONS = DAYS.map((value) => ({
	value,
	get label(): string {
		const t = translator("records");
		return t("activityRecency.activeWithin", { days: Number(value) });
	},
}));
