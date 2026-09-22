export const LOCALES = ["en", "pt-BR"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
	return LOCALES.some((locale) => locale === value);
}

export function appLocale(): Locale {
	const value =
		process.env.NEXT_PUBLIC_CRM_LOCALE ?? process.env.CRM_LOCALE ?? "";
	return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function appTimeZone(): string {
	return (
		process.env.NEXT_PUBLIC_CRM_TIME_ZONE ?? process.env.CRM_TIME_ZONE ?? "UTC"
	);
}
