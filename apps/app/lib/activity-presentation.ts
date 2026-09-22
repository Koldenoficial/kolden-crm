import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import Chat from "@carbon/icons-react/es/Chat";
import Email from "@carbon/icons-react/es/Email";
import Events from "@carbon/icons-react/es/Events";
import MagicWand from "@carbon/icons-react/es/MagicWand";
import Phone from "@carbon/icons-react/es/Phone";
import Task from "@carbon/icons-react/es/Task";
import type { ActivityType } from "@crm/db/enums";
import { translator } from "@crm/i18n/translator";
import type { CarbonIcon } from "@crm/ui/components/icon";

type ActivityPresentation = Record<ActivityType, { icon: CarbonIcon }>;

const PRESENTATION: ActivityPresentation = {
	NOTE: { icon: Chat },
	CALL: { icon: Phone },
	EMAIL: { icon: Email },
	MEETING: { icon: Events },
	TASK: { icon: Task },
	STAGE_CHANGE: { icon: ArrowRight },
	ENRICHMENT: { icon: MagicWand },
};

export function activityLabel(type: ActivityType): string {
	const t = translator("records");
	switch (type) {
		case "NOTE":
			return t("activityType.note");
		case "CALL":
			return t("activityType.call");
		case "EMAIL":
			return t("activityType.email");
		case "MEETING":
			return t("activityType.meeting");
		case "TASK":
			return t("activityType.task");
		case "STAGE_CHANGE":
			return t("activityType.stageChange");
		case "ENRICHMENT":
			return t("activityType.enrichment");
	}
}

export function activityIcon(type: ActivityType): CarbonIcon {
	return PRESENTATION[type].icon;
}
