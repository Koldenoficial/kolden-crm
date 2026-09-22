import { appLocale, appTimeZone } from "@crm/i18n";
import { messagesFor } from "@crm/i18n/messages";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
	const locale = appLocale();
	return {
		locale,
		messages: messagesFor(locale),
		timeZone: appTimeZone(),
	};
});
