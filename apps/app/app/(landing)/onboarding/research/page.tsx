import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { requireMailboxAccess } from "@/lib/session";
import { ResearchForm } from "./research-form";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("auth.onboarding.research");
	return { title: t("metaTitle") };
}

export const instant = false;

export default async function ResearchKeyPage() {
	await requireMailboxAccess();
	const t = await getTranslations("auth.onboarding.research");

	return (
		<AuthShell>
			<AuthHeading title={t("title")} description={t("description")} />

			<ResearchForm />
		</AuthShell>
	);
}
