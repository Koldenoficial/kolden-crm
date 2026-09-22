"use client";

import Add from "@carbon/icons-react/es/Add";
import { appLocale } from "@crm/i18n";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import { Field, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import { TableCell } from "@crm/ui/components/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { toast } from "sonner";
import { LocalRelativeTime } from "@/components/local-date-time";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const CELL = "px-3 py-2.5 align-middle";

export function AllowedDomains() {
	const t = useTranslations("settings");
	const trpc = useTRPC();
	const cache = useCrmCache();

	const COLUMNS: SimpleTableColumn[] = [
		{ id: "domain", header: t("tracking.allowedDomains.headers.domain") },
		{
			id: "scope",
			header: t("tracking.allowedDomains.headers.scope"),
			width: "w-40",
		},
		{
			id: "pageViews",
			header: t("tracking.allowedDomains.headers.pageViews"),
			width: "w-28",
			align: "right",
		},
		{
			id: "lastSeen",
			header: t("tracking.allowedDomains.headers.lastSeen"),
			width: "w-28",
			align: "right",
		},
		{
			id: "actions",
			srLabel: t("tracking.allowedDomains.headers.actions"),
			width: "w-24",
		},
	];

	const SCOPES = {
		SITE_AND_SUBDOMAINS: t("tracking.allowedDomains.scopes.siteAndSubdomains"),
		EXACT_HOST: t("tracking.allowedDomains.scopes.exactHost"),
	} as const;

	const tracking = useQuery(trpc.tracking.settings.queryOptions());

	const remove = useMutation(
		trpc.tracking.removeDomain.mutationOptions({
			onSuccess: async () => {
				await cache.tracking();
				toast.success(t("tracking.allowedDomains.removed"));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!tracking.data) return null;

	const { domains, canManage } = tracking.data;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("tracking.allowedDomains.title")}</CardTitle>
				<CardDescription>
					{t("tracking.allowedDomains.description")}
				</CardDescription>

				<CardAction>
					<AddDomain disabled={!canManage} />
				</CardAction>
			</CardHeader>

			{domains.length === 0 ? (
				<CardTableEmpty>{t("tracking.allowedDomains.empty")}</CardTableEmpty>
			) : (
				<SimpleTable columns={COLUMNS}>
					{domains.map((domain) => (
						<SimpleTableRow key={domain.id}>
							<TableCell className={CELL}>
								<span className="font-mono">{domain.host}</span>
							</TableCell>
							<TableCell className={`${CELL} text-muted-foreground`}>
								{SCOPES[domain.scope]}
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{domain.pageViews.toLocaleString(appLocale())}
							</TableCell>
							<TableCell className={`${CELL} text-right text-muted-foreground`}>
								{domain.lastSeenAt ? (
									<LocalRelativeTime date={domain.lastSeenAt} />
								) : (
									"—"
								)}
							</TableCell>
							<TableCell className={`${CELL} text-right`}>
								{canManage ? (
									<Button
										variant="ghost"
										size="sm"
										disabled={remove.isPending}
										onClick={() => remove.mutate({ id: domain.id })}
									>
										{t("tracking.allowedDomains.remove")}
									</Button>
								) : null}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			)}
		</Card>
	);
}

function AddDomain({ disabled }: { disabled: boolean }) {
	const t = useTranslations("settings");
	const trpc = useTRPC();
	const cache = useCrmCache();

	const SCOPES = {
		SITE_AND_SUBDOMAINS: t("tracking.allowedDomains.scopes.siteAndSubdomains"),
		EXACT_HOST: t("tracking.allowedDomains.scopes.exactHost"),
	} as const;

	const hostId = useId();
	const scopeId = useId();

	const [open, setOpen] = useState(false);
	const [host, setHost] = useState("");
	const [scope, setScope] = useState<keyof typeof SCOPES>(
		"SITE_AND_SUBDOMAINS",
	);

	const add = useMutation(
		trpc.tracking.addDomain.mutationOptions({
			onSuccess: async () => {
				await cache.tracking();
				setOpen(false);
				setHost("");
				toast.success(t("tracking.allowedDomains.added"));
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button size="sm" disabled={disabled}>
					<Icon icon={Add} data-icon="inline-start" />
					{t("tracking.allowedDomains.addButton")}
				</Button>
			</PopoverTrigger>

			<PopoverContent align="end" className="w-80">
				<form
					className="flex flex-col gap-4"
					onSubmit={(event) => {
						event.preventDefault();
						add.mutate({ host: host.trim(), scope });
					}}
				>
					<Field>
						<FieldLabel htmlFor={hostId}>
							{t("tracking.allowedDomains.domainLabel")}
						</FieldLabel>
						<Input
							id={hostId}
							value={host}
							onChange={(event) => setHost(event.target.value)}
							placeholder="acme.com"
							autoComplete="off"
							autoCapitalize="off"
							autoCorrect="off"
							spellCheck={false}
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor={scopeId}>
							{t("tracking.allowedDomains.scopeLabel")}
						</FieldLabel>
						<Select
							value={scope}
							onValueChange={(next) => setScope(next as keyof typeof SCOPES)}
						>
							<SelectTrigger id={scopeId} className="w-full">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{Object.entries(SCOPES).map(([value, label]) => (
									<SelectItem key={value} value={value}>
										{label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>

					<Button type="submit" disabled={add.isPending || host.trim() === ""}>
						{add.isPending ? <Spinner data-icon="inline-start" /> : null}
						{t("tracking.allowedDomains.addButton")}
					</Button>
				</form>
			</PopoverContent>
		</Popover>
	);
}
