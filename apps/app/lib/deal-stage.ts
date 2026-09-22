import { DealStage } from "@crm/db/enums";
import { translator } from "@crm/i18n/translator";
import type { StatusTone } from "@crm/ui/components/status-indicator";

const ORDER = [
	DealStage.DEMO_BOOKED,
	DealStage.QUALIFIED_TO_BUY,
	DealStage.DECISION_MAKER_BOUGHT_IN,
	DealStage.CONTRACT_SENT,
	DealStage.CLOSED_WON,
	DealStage.CLOSED_LOST,
	DealStage.UNQUALIFIED_TO_BUY,
] as const;

type DealStageTone = Record<DealStage, StatusTone>;

const TONE: DealStageTone = {
	DEMO_BOOKED: "neutral",
	QUALIFIED_TO_BUY: "info",
	DECISION_MAKER_BOUGHT_IN: "info",
	CONTRACT_SENT: "warning",
	CLOSED_WON: "success",
	CLOSED_LOST: "error",
	UNQUALIFIED_TO_BUY: "neutral",
};

export const OPEN_STAGES = ORDER.slice(0, 4) as readonly DealStage[];

export const LOSING_STAGES: readonly DealStage[] = [
	DealStage.CLOSED_LOST,
	DealStage.UNQUALIFIED_TO_BUY,
];

export const DEAL_STAGE_OPTIONS = ORDER.map((value) => ({
	value,
	get label(): string {
		return dealStageLabel(value);
	},
}));

const OPEN_STAGE_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
] as const;

export function isClosedStage(stage: DealStage): boolean {
	return !OPEN_STAGES.includes(stage);
}

export function dealStageColor(stage: DealStage): string {
	return OPEN_STAGE_COLORS[OPEN_STAGES.indexOf(stage)] ?? "var(--chart-5)";
}

export function dealStageLabel(stage: DealStage): string {
	const t = translator("records");
	switch (stage) {
		case "DEMO_BOOKED":
			return t("dealStage.demoBooked");
		case "QUALIFIED_TO_BUY":
			return t("dealStage.qualifiedToBuy");
		case "DECISION_MAKER_BOUGHT_IN":
			return t("dealStage.decisionMakerBoughtIn");
		case "CONTRACT_SENT":
			return t("dealStage.contractSent");
		case "CLOSED_WON":
			return t("dealStage.closedWon");
		case "CLOSED_LOST":
			return t("dealStage.closedLost");
		case "UNQUALIFIED_TO_BUY":
			return t("dealStage.unqualified");
	}
}

type DealStagePresentation = { label: string; tone: StatusTone };

export function dealStagePresentation(stage: DealStage): DealStagePresentation {
	return { label: dealStageLabel(stage), tone: TONE[stage] };
}
