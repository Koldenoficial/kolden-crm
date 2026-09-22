import { translator } from "@crm/i18n/translator";
import { type Handoff, schemas } from "@crm/validation";

export function handoffResources(handoff: Handoff) {
	const t = translator("agentBuilder");

	return [
		{
			kind: "integration" as const,
			id: "slack:workspace",
			label: t("handoff.slackLabel"),
			detail: t("handoff.slackDetail"),
		},
		...(handoff.channel
			? [
					{
						kind: "integration" as const,
						id: `slack:channel:${handoff.channel.id}`,
						label: `#${handoff.channel.name}`,
						detail: handoff.channel.isMember
							? t("handoff.channelMemberDetail")
							: t("handoff.channelNotMemberDetail"),
					},
				]
			: []),
	];
}

export function handoffBrief(handoff: Handoff): string {
	const t = translator("agentBuilder");
	const lines = [t("handoff.buildNamed", { name: handoff.name }), handoff.job];

	if (handoff.channel) {
		lines.push(t("handoff.postsToChannel", { channel: handoff.channel.name }));
	}

	lines.push(
		[
			t("handoff.permissionsHeader"),
			...schemas.agents.permissions.map(
				(entry) =>
					`- ${entry.label}: ${
						handoff.allowed.includes(entry.id)
							? t("handoff.permissionAllowed")
							: t("handoff.permissionNotAllowed")
					}`,
			),
		].join("\n"),
	);

	return lines.join("\n\n");
}
