import type { EnrichmentStatus } from "@crm/db/enums";
import { translator } from "@crm/i18n/translator";
import type { StatusTone } from "@crm/ui/components/status-indicator";

type EnrichmentPresentation = Record<
	EnrichmentStatus,
	{ tone: StatusTone; busy?: boolean }
>;

const PRESENTATION: EnrichmentPresentation = {
	PENDING: { tone: "neutral" },
	RUNNING: { tone: "info", busy: true },
	COMPLETE: { tone: "success" },
	FAILED: { tone: "error" },
	SKIPPED: { tone: "neutral" },
};

export const ENRICHMENT_POLL_MS = 3_000;

export const ENRICHMENT_IDLE_POLL_MS = 30_000;

function enrichmentLabel(
	status: EnrichmentStatus,
	t: ReturnType<typeof translator<"records">>,
): string {
	switch (status) {
		case "PENDING":
			return t("enrichmentStatus.pending");
		case "RUNNING":
			return t("enrichmentStatus.running");
		case "COMPLETE":
			return t("enrichmentStatus.complete");
		case "FAILED":
			return t("enrichmentStatus.failed");
		case "SKIPPED":
			return t("enrichmentStatus.skipped");
	}
}

export const ENRICHMENT_FACET_OPTIONS = (
	Object.keys(PRESENTATION) as EnrichmentStatus[]
).map((value) => ({
	value,
	get label(): string {
		return enrichmentLabel(value, translator("records"));
	},
}));

type EnrichmentDisplay = {
	label: string;
	tone: StatusTone;
	busy?: boolean;
};

export function enrichmentPresentation(
	status: EnrichmentStatus,
	queued: boolean,
): EnrichmentDisplay {
	const t = translator("records");
	if (status === "PENDING" && queued) {
		return {
			label: t("enrichmentStatus.queued"),
			tone: "neutral",
			busy: false,
		};
	}
	const presentation = PRESENTATION[status];
	return {
		label: enrichmentLabel(status, t),
		tone: presentation.tone,
		busy: presentation.busy,
	};
}

export function isEnriching(status: EnrichmentStatus, queued = false): boolean {
	return status === "RUNNING" || (status === "PENDING" && queued);
}
