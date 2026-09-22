import Close from "@carbon/icons-react/es/Close";
import Warning from "@carbon/icons-react/es/Warning";
import {
	describeSlackScopes,
	SLACK_REQUESTED_SCOPES,
	SLACK_SCOPE_GROUPS,
	SLACK_USER_GRANT,
	type SlackScope,
	slackScopeDrift,
} from "@crm/auth";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@crm/ui/components/alert";
import SlackLogo from "@crm/ui/components/brand-logos/slack";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { NewAgentDialog } from "@/components/agent-builder/new-agent-dialog";
import { requireSession } from "@/lib/session";
import { getServerQueryClient, getServerTrpc } from "@/lib/trpc/server";
import { ConnectionPage, ConnectionPageLoading } from "../connection-page";
import { type ConnectionQuery, connectErrorOf } from "../oauth-connection-page";
import { SlackChannels } from "./slack-channels";
import {
	SlackConnectButton,
	SlackReconnectButton,
} from "./slack-connect-button";
import { SlackDisconnectButton } from "./slack-disconnect-button";
import { SlackScopeGroups } from "./slack-scope-groups";

const PRIVATE_CHANNEL_SCOPES = [
	"groups:read",
	"groups:history",
	SLACK_USER_GRANT.scope,
];

type Translate = Awaited<ReturnType<typeof getTranslations<"settings">>>;

function neverItems(t: Translate): string[] {
	return [
		t("connections.slack.never.sendUntilAutomation"),
		t("connections.slack.never.postOutsideDestination"),
		t("connections.slack.never.readDirectMessage"),
	];
}

function suggestionItems(t: Translate): [string, string][] {
	return [
		[
			t("connections.slack.suggestions.dealCreated.title"),
			t("connections.slack.suggestions.dealCreated.description"),
		],
		[
			t("connections.slack.suggestions.dealWon.title"),
			t("connections.slack.suggestions.dealWon.description"),
		],
		[
			t("connections.slack.suggestions.dealReopened.title"),
			t("connections.slack.suggestions.dealReopened.description"),
		],
	];
}

type SlackConnectionPageProps = {
	params: Promise<{ slug: string }>;
	searchParams: Promise<ConnectionQuery>;
};

export default function SlackConnectionPage(props: SlackConnectionPageProps) {
	return (
		<Suspense fallback={<ConnectionPageLoading />}>
			<SlackConnectionPageContent {...props} />
		</Suspense>
	);
}

async function SlackConnectionPageContent({
	params,
	searchParams,
}: SlackConnectionPageProps) {
	await requireSession();
	const t = await getTranslations("settings");
	const [{ slug }, query] = await Promise.all([params, searchParams]);
	const queryClient = getServerQueryClient();
	const status = await queryClient.fetchQuery(
		getServerTrpc().slack.status.queryOptions(),
	);
	return status.connected ? (
		<ConnectedSlack slug={slug} status={status} t={t} />
	) : (
		<ConnectionPage centered className="max-w-(--container-page)">
			<header className="flex flex-col gap-3 px-(--spacing-block-inline)">
				<div className="flex items-center gap-3">
					<SlackLogo className="size-6" />
					<h1 className="font-medium text-xl">Slack</h1>
					<span className="ml-auto text-muted-foreground text-sm">
						{t("connections.slack.notConnected")}
					</span>
				</div>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{t("connections.slack.introDescription")}
				</p>
			</header>
			<SlackScopeGroups
				groups={groupScopes([...SLACK_REQUESTED_SCOPES], t)}
				title={t("connections.slack.handingOverTitle")}
				withheld={[]}
			/>
			<PlainList
				title={t("connections.slack.neverTitle")}
				items={neverItems(t)}
				icon={Close}
				tone="text-muted-foreground"
			/>
			<div className="flex items-center gap-4 border-y px-(--spacing-block-inline) py-5">
				<SlackConnectButton
					slug={slug}
					configured={status.configured}
					connectError={connectErrorOf(query, "slack")}
				/>
				<p className="text-muted-foreground text-xs">
					{t("connections.slack.approveNote")}
				</p>
			</div>
			<section className="flex flex-col gap-3 px-(--spacing-block-inline)">
				<div>
					<h2 className="font-medium text-sm">
						{t("connections.slack.suggestionsTitle")}
					</h2>
					<p className="text-muted-foreground text-xs">
						{t("connections.slack.suggestionsSubtitle")}
					</p>
				</div>
				<div className="grid gap-3 md:grid-cols-3">
					{suggestionItems(t).map(([name, description]) => (
						<div className="rounded-lg border p-4" key={name}>
							<h3 className="font-medium text-sm">{name}</h3>
							<p className="mt-2 text-muted-foreground text-xs leading-relaxed">
								{description}
							</p>
						</div>
					))}
				</div>
			</section>
		</ConnectionPage>
	);
}

const SCOPE_KEYS: Record<
	string,
	| "usersRead"
	| "usersReadEmail"
	| "channelsRead"
	| "groupsRead"
	| "channelsHistory"
	| "groupsHistory"
	| "chatWrite"
	| "chatWritePublic"
	| "imWrite"
	| "channelsJoin"
	| "channelsManage"
	| "groupsWrite"
	| "channelsWriteInvites"
	| "groupsWriteInvites"
	| "conversationsConnectWrite"
	| "linksWrite"
	| "slackUserInvite"
> = {
	"users:read": "usersRead",
	"users:read.email": "usersReadEmail",
	"channels:read": "channelsRead",
	"groups:read": "groupsRead",
	"channels:history": "channelsHistory",
	"groups:history": "groupsHistory",
	"chat:write": "chatWrite",
	"chat:write.public": "chatWritePublic",
	"im:write": "imWrite",
	"channels:join": "channelsJoin",
	"channels:manage": "channelsManage",
	"groups:write": "groupsWrite",
	"channels:write.invites": "channelsWriteInvites",
	"groups:write.invites": "groupsWriteInvites",
	"conversations.connect:write": "conversationsConnectWrite",
	"links:write": "linksWrite",
	"slack:user-invite": "slackUserInvite",
};

function toLine(entry: SlackScope, t: Translate) {
	const key = SCOPE_KEYS[entry.scope];
	return {
		scope: entry.scope,
		grant: key ? t(`connections.slack.scope.${key}`) : entry.grant,
		sensitive: entry.sensitive,
	};
}

function groupScopes(scopes: string[], t: Translate) {
	const held = describeSlackScopes(scopes);

	return SLACK_SCOPE_GROUPS.map((group) => ({
		id: group.id,
		label: t(`connections.slack.scopeGroup.${group.id}.label`),
		summary: t(`connections.slack.scopeGroup.${group.id}.summary`),
		scopes: held
			.filter((entry) => entry.group === group.id)
			.map((entry) => toLine(entry, t)),
	})).filter((group) => group.scopes.length > 0);
}

function ConnectedSlack({
	slug,
	status,
	t,
}: {
	slug: string;
	status: {
		workspace: string | null;
		agents: Array<{
			id: string;
			name: string;
			description: string | null;
			status: string;
		}>;
		scopes: string[];
		canInviteItself: boolean;
		canManage: boolean;
		people: { matched: number; reviewed: number };
	};
	t: Translate;
}) {
	const agents = status.agents;
	const drift = slackScopeDrift(status.scopes);
	const missing = status.canInviteItself
		? drift.missing
		: [...drift.missing, SLACK_USER_GRANT];
	return (
		<ConnectionPage>
			<header className="flex flex-col gap-2 px-(--spacing-block-inline)">
				<div className="flex items-center gap-3">
					<SlackLogo className="size-6" />
					<h1 className="font-medium text-xl">Slack</h1>
					<span className="ml-auto text-muted-foreground text-sm">
						{status.workspace ?? t("connections.slack.connectedFallback")}
					</span>
					<SlackDisconnectButton
						canManage={status.canManage}
						workspace={status.workspace}
					/>
				</div>
				<p className="text-muted-foreground text-sm">
					{status.canManage
						? t("connections.slack.summaryManage")
						: t("connections.slack.summaryReadOnly")}
				</p>
			</header>
			<MissingGrant missing={missing} slug={slug} t={t} />
			<SlackScopeGroups
				groups={groupScopes(status.scopes, t)}
				title={t("connections.slack.grantedTitle")}
				withheld={missing.map((entry) => toLine(entry, t))}
			/>
			<SlackChannels />
			<section className="flex flex-col gap-3 border-y px-(--spacing-block-inline) py-5">
				<div className="flex items-end justify-between gap-4">
					<div>
						<h2 className="font-medium text-sm">
							{t("connections.slack.agentsTitle")}
						</h2>
						<p className="text-muted-foreground text-xs">
							{t("connections.slack.agentsSubtitle")}
						</p>
					</div>
					<NewAgentDialog>
						<Button size="sm">{t("connections.slack.newAgent")}</Button>
					</NewAgentDialog>
				</div>
				<div className="flex flex-col divide-y rounded-lg border">
					{agents.length === 0 ? (
						<p className="px-(--spacing-block-inline) py-4 text-muted-foreground text-sm">
							{t("connections.slack.noAgents")}
						</p>
					) : null}
					{agents.map(
						(agent: {
							id: string;
							name: string;
							description: string | null;
							status: string;
						}) => (
							<Link
								className="flex items-center gap-3 px-(--spacing-block-inline) py-4 hover:bg-muted/50"
								href={`/${slug}/agents/${agent.id}`}
								key={agent.id}
							>
								<div className="min-w-0 flex-1">
									<h3 className="font-medium text-sm">{agent.name}</h3>
									<p className="truncate text-muted-foreground text-xs">
										{agent.description}
									</p>
								</div>
								<span className="flex w-19 shrink-0 items-center gap-2 text-xs">
									<span
										className={`size-2 rounded-full ${agent.status === "LIVE" ? "bg-success" : "bg-muted-foreground"}`}
									/>
									{agent.status === "LIVE"
										? t("connections.slack.running")
										: t("connections.slack.paused")}
								</span>
							</Link>
						),
					)}
					<Link
						className="px-(--spacing-block-inline) py-4 font-medium text-sm hover:bg-muted/50"
						href={`/${slug}/chat`}
					>
						{t("connections.slack.describeAnotherAgent")}
					</Link>
				</div>
			</section>
			<div className="flex items-center justify-between gap-4 px-(--spacing-block-inline)">
				<p className="text-sm">
					{status.people.reviewed === 0
						? t("connections.slack.noPeopleReviewed")
						: t("connections.slack.peopleMatched", {
								matched: status.people.matched,
								reviewed: status.people.reviewed,
							})}
				</p>
				<Button asChild variant="outline" size="sm">
					<Link href={`/${slug}/settings/connections/slack/people`}>
						{t("connections.slack.review")}
					</Link>
				</Button>
			</div>
		</ConnectionPage>
	);
}

function MissingGrant({
	slug,
	missing,
	t,
}: {
	slug: string;
	missing: SlackScope[];
	t: Translate;
}) {
	if (missing.length === 0) return null;

	const privateChannels = missing.some((entry) =>
		PRIVATE_CHANNEL_SCOPES.includes(entry.scope),
	);

	return (
		<div className="px-(--spacing-block-inline)">
			<Alert variant="warning">
				<Icon icon={Warning} />
				<AlertTitle>
					{privateChannels
						? t("connections.slack.cannotReachPrivate")
						: t("connections.slack.heldBackPermissions", {
								count: missing.length,
							})}
				</AlertTitle>
				<AlertDescription>
					<span>{t("connections.slack.reconnectNote")}</span>
					<ul className="mt-2 flex flex-col gap-1.5">
						{missing.map((entry) => (
							<li className="flex items-start gap-2" key={entry.scope}>
								<Icon
									icon={Close}
									motion="none"
									className="mt-0.5 size-3.5 shrink-0"
								/>
								<span>{entry.grant}</span>
							</li>
						))}
					</ul>
				</AlertDescription>
				<AlertAction>
					<SlackReconnectButton slug={slug} />
				</AlertAction>
			</Alert>
		</div>
	);
}

function PlainList({
	title,
	items,
	icon,
	tone,
}: {
	title: string;
	items: string[];
	icon: React.ComponentType;
	tone: string;
}) {
	return (
		<section className="flex flex-col gap-3 px-(--spacing-block-inline)">
			<h2 className="font-medium text-sm">{title}</h2>
			<div className="flex flex-col gap-2">
				{items.map((item) => (
					<div className="flex items-start gap-3 text-sm" key={item}>
						<Icon
							icon={icon}
							motion="none"
							className={`mt-0.5 size-4 shrink-0 ${tone}`}
						/>
						<span>{item}</span>
					</div>
				))}
			</div>
		</section>
	);
}
