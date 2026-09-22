import { type MailboxProviderId, mailboxGrantsNeeded } from "@crm/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { requireSession, signInAccounts } from "@/lib/session";
import { GrantAccess } from "./grant-access";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("auth.grantAccess");
	return { title: t("metaTitle") };
}

export const instant = false;

export default async function GrantAccessPage() {
	const { user } = await requireSession();
	const t = await getTranslations("auth.grantAccess");

	const providers = mailboxGrantsNeeded(await signInAccounts(user.id));

	if (providers.length === 0) {
		redirect("/");
	}

	const description = {
		google: t("descriptionGoogle"),
		microsoft: t("descriptionMicrosoft"),
	} satisfies Record<MailboxProviderId, string>;

	const only = providers.length === 1 ? providers[0] : undefined;

	return (
		<AuthShell>
			<AuthHeading
				title={t("title")}
				description={
					(only ? description[only] : undefined) ?? t("descriptionBoth")
				}
			/>

			<GrantAccess providers={providers} />

			<p className="text-center text-muted-foreground text-sm/5">
				{t("privacyNote")}
			</p>
		</AuthShell>
	);
}
