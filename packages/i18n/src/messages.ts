import enAgentBuilder from "../messages/en/agentBuilder.json";
import enApi from "../messages/en/api.json";
import enAuth from "../messages/en/auth.json";
import enDashboard from "../messages/en/dashboard.json";
import enDataTable from "../messages/en/dataTable.json";
import enLists from "../messages/en/lists.json";
import enRecords from "../messages/en/records.json";
import enSettings from "../messages/en/settings.json";
import enShell from "../messages/en/shell.json";
import enUi from "../messages/en/ui.json";
import ptAgentBuilder from "../messages/pt-BR/agentBuilder.json";
import ptApi from "../messages/pt-BR/api.json";
import ptAuth from "../messages/pt-BR/auth.json";
import ptDashboard from "../messages/pt-BR/dashboard.json";
import ptDataTable from "../messages/pt-BR/dataTable.json";
import ptLists from "../messages/pt-BR/lists.json";
import ptRecords from "../messages/pt-BR/records.json";
import ptSettings from "../messages/pt-BR/settings.json";
import ptShell from "../messages/pt-BR/shell.json";
import ptUi from "../messages/pt-BR/ui.json";
import type { Locale } from "./index";

const en = {
	agentBuilder: enAgentBuilder,
	api: enApi,
	auth: enAuth,
	dashboard: enDashboard,
	dataTable: enDataTable,
	lists: enLists,
	records: enRecords,
	settings: enSettings,
	shell: enShell,
	ui: enUi,
};

export type Messages = typeof en;

export type Namespace = keyof Messages;

type Catalog = Record<Locale, Messages>;

const catalog: Catalog = {
	en,
	"pt-BR": {
		agentBuilder: ptAgentBuilder,
		api: ptApi,
		auth: ptAuth,
		dashboard: ptDashboard,
		dataTable: ptDataTable,
		lists: ptLists,
		records: ptRecords,
		settings: ptSettings,
		shell: ptShell,
		ui: ptUi,
	} as Messages,
};

export function messagesFor(locale: Locale): Messages {
	return catalog[locale];
}

export const allMessages = catalog;
