import { translator } from "@crm/i18n/translator";
import {
	type EveToolFields,
	type EveToolInput,
	eveToolText,
} from "@crm/validation/eve-tool";

type LabelInput = {
	tool: string;
	input: EveToolInput;
	label: string;
	pending: boolean;
};

export function toolLabel(item: LabelInput): string {
	const t = translator("agentBuilder");
	const fromInput = item.input
		? inputLabel(t, item.tool, item.input, item.pending)
		: null;
	return fromInput ?? item.label;
}

function inputLabel(
	t: ReturnType<typeof translator<"agentBuilder">>,
	tool: string,
	input: EveToolFields,
	pending: boolean,
): string | null {
	if (tool === "write_agent_file") {
		const path = eveToolText.parse(input.path);
		if (!path) return null;
		const name = artifactName(t, path);
		return pending
			? t("toolLabels.writeAgentFile.writing", { name })
			: t("toolLabels.writeAgentFile.wrote", { name });
	}

	if (tool === "save_agent_draft") {
		const name = eveToolText.parse(input.name).trim();
		const verb = pending
			? t("toolLabels.saveAgentDraft.saving")
			: t("toolLabels.saveAgentDraft.saved");
		return name ? `${verb} · ${name}` : verb;
	}

	if (tool === "set_chat_title") {
		const title = eveToolText.parse(input.title).trim();
		const verb = pending
			? t("toolLabels.setChatTitle.naming")
			: t("toolLabels.setChatTitle.named");
		return title ? `${verb} · ${title}` : verb;
	}

	return null;
}

function artifactName(
	t: ReturnType<typeof translator<"agentBuilder">>,
	path: string,
): string {
	if (path === "agent/instructions.md")
		return t("toolLabels.artifactNames.instructions");
	if (path === "agent/manifest.json")
		return t("toolLabels.artifactNames.manifest");
	if (path === "agent/README.md") return t("toolLabels.artifactNames.readme");
	return path;
}
