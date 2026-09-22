"use client";

import { appLocale } from "@crm/i18n";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useTRPC } from "@/lib/trpc/client";

const CELL = "px-3 py-2.5 align-middle";

export function TrafficSources() {
	const t = useTranslations("settings");
	const trpc = useTRPC();
	const sources = useQuery(trpc.tracking.sources.queryOptions());

	const COLUMNS: SimpleTableColumn[] = [
		{ id: "source", header: t("tracking.trafficSources.headers.source") },
		{
			id: "medium",
			header: t("tracking.trafficSources.headers.medium"),
			width: "w-32",
		},
		{
			id: "views",
			header: t("tracking.trafficSources.headers.pageViews"),
			width: "w-28",
			align: "right",
		},
		{
			id: "contacts",
			header: t("tracking.trafficSources.headers.contacts"),
			width: "w-24",
			align: "right",
		},
	];

	if (!sources.data) return null;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("tracking.trafficSources.title")}</CardTitle>
				<CardDescription>
					{t("tracking.trafficSources.description")}
				</CardDescription>
			</CardHeader>

			{sources.data.length === 0 ? (
				<CardTableEmpty>{t("tracking.trafficSources.empty")}</CardTableEmpty>
			) : (
				<SimpleTable columns={COLUMNS}>
					{sources.data.map((row) => (
						<SimpleTableRow key={`${row.source}-${row.medium ?? ""}`}>
							<TableCell className={CELL}>{row.source}</TableCell>
							<TableCell className={`${CELL} text-muted-foreground`}>
								{row.medium ?? "—"}
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{row.views.toLocaleString(appLocale())}
							</TableCell>
							<TableCell className={`${CELL} text-right tabular-nums`}>
								{row.contacts.toLocaleString(appLocale())}
							</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			)}
		</Card>
	);
}
