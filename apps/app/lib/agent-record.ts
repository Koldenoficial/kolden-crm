import { translator } from "@crm/i18n/translator";
import type { CarbonIcon } from "@crm/ui/components/icon";

export type AgentRecordKind = "contact" | "company" | "deal";

export type AgentRecord = { kind: AgentRecordKind; id: string };

type RecordCopy = {
	header: string;
	field: "contactId" | "companyId" | "dealId";
	title: string;
	blurb: string;
	placeholder: string;
	suggestions: string[];
};

type RecordMeta = {
	header: string;
	field: "contactId" | "companyId" | "dealId";
};

type RecordMetaByKind = Record<AgentRecordKind, RecordMeta>;

export type AgentRecordHeader = Record<string, string>;

export type AgentRecordFilter = {
	contactId?: string;
	companyId?: string;
	dealId?: string;
};

const META: RecordMetaByKind = {
	contact: { header: "x-crm-contact", field: "contactId" },
	company: { header: "x-crm-company", field: "companyId" },
	deal: { header: "x-crm-deal", field: "dealId" },
};

export function recordCopy(kind: AgentRecordKind): RecordCopy {
	const t = translator("records");
	return {
		...META[kind],
		title: t(`agentRecord.${kind}.title`),
		blurb: t(`agentRecord.${kind}.blurb`),
		placeholder: t(`agentRecord.${kind}.placeholder`),
		suggestions: [
			t(`agentRecord.${kind}.suggestions.0`),
			t(`agentRecord.${kind}.suggestions.1`),
			t(`agentRecord.${kind}.suggestions.2`),
		],
	};
}

export function recordHeader(record: AgentRecord): AgentRecordHeader {
	return { [META[record.kind].header]: record.id };
}

export function recordFilter(record: AgentRecord): AgentRecordFilter {
	return { [META[record.kind].field]: record.id };
}

export type { CarbonIcon };
