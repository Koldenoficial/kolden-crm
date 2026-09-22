import { translator } from "@crm/i18n/translator";
import type { RecordKind } from "@/components/crm/record-sheet/record-stack";
import type { FieldEntity } from "./fields-entity";

export function sheetTitle(): string {
	return translator("records")("fields.sheetTitle");
}

export function subtitleFor(kind: RecordKind): string {
	const t = translator("records");
	switch (kind) {
		case "company":
			return t("fields.subtitle.company");
		case "contact":
			return t("fields.subtitle.contact");
		case "deal":
			return t("fields.subtitle.deal");
	}
}

export function standardRow(): string {
	return translator("records")("fields.standardRow");
}
export function standardNote(): string {
	return translator("records")("fields.standardNote");
}
export function suggestedRow(): string {
	return translator("records")("fields.suggestedRow");
}
export function suggestedNote(): string {
	return translator("records")("fields.suggestedNote");
}
export function addLabel(): string {
	return translator("records")("fields.add");
}
export function customGroup(): string {
	return translator("records")("fields.customGroup");
}
export function dragNote(): string {
	return translator("records")("fields.dragNote");
}
export function archivedRow(): string {
	return translator("records")("fields.archivedRow");
}
export function archivedNote(): string {
	return translator("records")("fields.archivedNote");
}
export function newField(): string {
	return translator("records")("fields.newField");
}
export function orderNote(): string {
	return translator("records")("fields.orderNote");
}
export function manualOnly(): string {
	return translator("records")("fields.manualOnly");
}
export function tableNote(): string {
	return translator("records")("fields.tableNote");
}
export function filterNote(): string {
	return translator("records")("fields.filterNote");
}

export function emptyTitle(): string {
	return translator("records")("fields.emptyTitle");
}
export function emptyBody(): string {
	return translator("records")("fields.emptyBody");
}

export function errorTitle(): string {
	return translator("records")("fields.errorTitle");
}
export function errorBody(): string {
	return translator("records")("fields.errorBody");
}
export function retry(): string {
	return translator("records")("fields.retry");
}

export function labelLabel(): string {
	return translator("records")("fields.labelLabel");
}
export function keyLabel(): string {
	return translator("records")("fields.keyLabel");
}
export function keyHelp(): string {
	return translator("records")("fields.keyHelp");
}
export function agentLabel(): string {
	return translator("records")("fields.agentLabel");
}
export function agentHelp(): string {
	return translator("records")("fields.agentHelp");
}
export function briefLabel(): string {
	return translator("records")("fields.briefLabel");
}
export function briefHelp(): string {
	return translator("records")("fields.briefHelp");
}
export function typeLabel(): string {
	return translator("records")("fields.typeLabel");
}
export function optionsLabel(): string {
	return translator("records")("fields.optionsLabel");
}
export function addOption(): string {
	return translator("records")("fields.addOption");
}
export function allFilled(): string {
	return translator("records")("fields.allFilled");
}

export function optionLabel(index: number): string {
	return translator("records")("fields.optionLabel", { number: index + 1 });
}
export function addField(): string {
	return translator("records")("fields.addField");
}
export function cancel(): string {
	return translator("records")("fields.cancel");
}
export function save(): string {
	return translator("records")("fields.save");
}
export function archive(): string {
	return translator("records")("fields.archive");
}
export function fillRest(): string {
	return translator("records")("fields.fillRest");
}

export function sheetPlacement(entity: FieldEntity): string {
	const t = translator("records");
	switch (entity) {
		case "COMPANY":
			return t("fields.sheetPlacement.company");
		case "CONTACT":
			return t("fields.sheetPlacement.contact");
		case "DEAL":
			return t("fields.sheetPlacement.deal");
	}
}

export function tablePlacement(entity: FieldEntity): string {
	const t = translator("records");
	switch (entity) {
		case "COMPANY":
			return t("fields.tablePlacement.company");
		case "CONTACT":
			return t("fields.tablePlacement.contact");
		case "DEAL":
			return t("fields.tablePlacement.deal");
	}
}

export function filterPlacement(entity: FieldEntity): string {
	const t = translator("records");
	switch (entity) {
		case "COMPANY":
			return t("fields.filterPlacement.company");
		case "CONTACT":
			return t("fields.filterPlacement.contact");
		case "DEAL":
			return t("fields.filterPlacement.deal");
	}
}

export function entityTabs(): readonly { kind: RecordKind; label: string }[] {
	const t = translator("records");
	return [
		{ kind: "company", label: t("quickSwitcher.companies") },
		{ kind: "contact", label: t("quickSwitcher.contacts") },
		{ kind: "deal", label: t("quickSwitcher.deals") },
	] as const;
}
