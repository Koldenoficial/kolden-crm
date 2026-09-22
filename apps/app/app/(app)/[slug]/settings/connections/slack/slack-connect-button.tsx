"use client";

import { authClient } from "@crm/auth/client";
import { Button } from "@crm/ui/components/button";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

function connectErrorMessage(
	t: ReturnType<typeof useTranslations<"settings">>,
	code: string,
): string {
	switch (code) {
		case "access_denied":
			return t("connections.slack.connectErrors.accessDenied");
		case "account_already_linked_to_different_user":
			return t("connections.slack.connectErrors.alreadyLinked");
		case "email_doesn't_match":
			return t("connections.slack.connectErrors.emailMismatch");
		case "oauth_code_verification_failed":
			return t("connections.slack.connectErrors.oauthCodeFailed");
		case "user_info_is_missing":
			return t("connections.slack.connectErrors.userInfoMissing");
		default:
			return t("connections.slack.connect.genericError", {
				reason: code.replaceAll("_", " "),
			});
	}
}

async function startSlackOAuth(
	slug: string,
	t: ReturnType<typeof useTranslations<"settings">>,
) {
	try {
		const { error } = await authClient.oauth2.link({
			providerId: "slack",
			callbackURL: `${window.location.origin}/${slug}/settings/connections/slack/people`,
			errorCallbackURL: `${window.location.origin}/${slug}/settings/connections/slack?provider=slack`,
		});
		if (error)
			toast.error(error.message || t("connections.slack.connect.unreachable"));
	} catch (error) {
		toast.error(
			error instanceof Error
				? error.message
				: t("connections.slack.connect.unreachable"),
		);
	}
}

export function SlackReconnectButton({ slug }: { slug: string }) {
	const t = useTranslations("settings");
	const [pending, setPending] = useState(false);

	return (
		<Button
			disabled={pending}
			onClick={async () => {
				setPending(true);
				await startSlackOAuth(slug, t);
				setPending(false);
			}}
			size="xs"
			variant="contrast"
		>
			{pending
				? t("connections.slack.connect.opening")
				: t("connections.slack.connect.reconnect")}
		</Button>
	);
}

export function SlackConnectButton({
	slug,
	configured,
	connectError,
}: {
	slug: string;
	configured: boolean;
	connectError?: string;
}) {
	const t = useTranslations("settings");
	const [pending, setPending] = useState(false);
	const connect = async () => {
		setPending(true);
		await startSlackOAuth(slug, t);
		setPending(false);
	};
	return (
		<div className="flex min-w-0 flex-col gap-2">
			<Button onClick={() => void connect()} disabled={!configured || pending}>
				{pending
					? t("connections.slack.connect.opening")
					: configured
						? t("connections.slack.connect.connectButton")
						: t("connections.slack.connect.notConfigured")}
			</Button>
			{connectError ? (
				<p role="alert" className="max-w-sm text-destructive text-xs">
					{connectErrorMessage(t, connectError)}
				</p>
			) : null}
		</div>
	);
}
