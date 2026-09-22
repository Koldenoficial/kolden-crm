import { appLocale } from "@crm/i18n";

export function languageInstructions(): string {
	if (appLocale() !== "pt-BR") return "";

	return "Write everything meant for the rep in Brazilian Portuguese: briefs, facts recorded as prose, recheck reasons, chat answers, agent-build summaries, and run summaries. Evidence you quote verbatim, such as an email or a signature block, stays in the language it was written in. A tool argument that is an enum value or a record id stays exactly as the tool expects, never translated.";
}
