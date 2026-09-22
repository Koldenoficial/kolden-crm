import type { Locale } from "@crm/i18n";
import type { Messages } from "@crm/i18n/messages";

declare module "next-intl" {
	interface AppConfig {
		Locale: Locale;
		Messages: Messages;
	}
}
