import type { MailboxProviderId } from "@crm/auth/scopes";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect, unstable_rethrow } from "next/navigation";
import { Suspense } from "react";
import { AuthHeading, AuthShell } from "@/components/auth-shell";
import { getSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { SocialSignIn } from "./social-sign-in";
import { type SsoProvider, SsoSignIn } from "./sso-sign-in";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("auth.signIn");
	return { title: t("metaTitle") };
}

type SignInOptions = {
	google: boolean;
	microsoft: boolean;
	providers: SsoProvider[];
};

async function signInOptions(): Promise<SignInOptions | null> {
	try {
		return await getServerQueryClient().fetchQuery(
			getServerTrpc().sso.signInOptions.queryOptions(),
		);
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not read the sign-in options.", error);
		return null;
	}
}

async function currentSession() {
	try {
		return await getSession();
	} catch (error) {
		unstable_rethrow(error);
		console.error("Sign-in: could not read the session.", error);
		return null;
	}
}

export default async function SignInPage({
	searchParams,
}: PageProps<"/sign-in">) {
	const t = await getTranslations("auth.signIn");
	return (
		<AuthShell>
			<Suspense
				fallback={
					<AuthHeading title={t("title")} description={t("description")} />
				}
			>
				<SignIn searchParams={searchParams} />
			</Suspense>
		</AuthShell>
	);
}

async function SignIn({
	searchParams,
}: Pick<PageProps<"/sign-in">, "searchParams">) {
	const t = await getTranslations("auth.signIn");
	const [session, options, { method }] = await Promise.all([
		currentSession(),
		signInOptions(),
		searchParams,
	]);

	if (session) {
		redirect("/");
	}

	const configured: MailboxProviderId[] = [];
	if (options?.google ?? true) configured.push("google");
	if (options?.microsoft ?? false) configured.push("microsoft");

	const providers = options?.providers ?? [];

	const insisted = configured.find((provider) => provider === method);
	const showSso = providers.length > 0 && insisted === undefined;
	const social =
		insisted !== undefined
			? [insisted]
			: providers.length === 0
				? configured
				: [];

	if (!showSso && social.length === 0) {
		return (
			<>
				<AuthHeading
					title={t("unconfigured.title")}
					description={t("unconfigured.description")}
				/>

				<p className="text-center text-muted-foreground text-sm/5">
					{t("unconfigured.help")}
				</p>
			</>
		);
	}

	return (
		<>
			<AuthHeading title={t("title")} description={t("description")} />

			{showSso ? <SsoSignIn providers={providers} /> : null}
			{social.map((provider) => (
				<SocialSignIn key={provider} provider={provider} />
			))}
		</>
	);
}
