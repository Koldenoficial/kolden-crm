import { createTranslator } from "use-intl/core";
import { appLocale, appTimeZone } from "./index";
import { type Messages, messagesFor, type Namespace } from "./messages";

export function translator<N extends Namespace>(namespace: N) {
	const locale = appLocale();
	return createTranslator<Messages, N>({
		locale,
		messages: messagesFor(locale),
		namespace,
		timeZone: appTimeZone(),
	});
}
