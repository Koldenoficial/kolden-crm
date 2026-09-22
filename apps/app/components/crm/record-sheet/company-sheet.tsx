"use client";

import Add from "@carbon/icons-react/es/Add";
import Partnership from "@carbon/icons-react/es/Partnership";
import Star from "@carbon/icons-react/es/Star";
import StarFilled from "@carbon/icons-react/es/StarFilled";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import type { FieldValueJson } from "@crm/db/fields";
import { Button } from "@crm/ui/components/button";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	EntityLogo,
	type EntityLogoTone,
} from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { formatMoney } from "@crm/ui/lib/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AgentPanel } from "@/components/crm/agent-panel";
import { EnrichmentActions } from "@/components/crm/enrichment-actions";
import { EnrichmentIndicator } from "@/components/crm/enrichment-status";
import { FieldsCog, RecordFields } from "@/components/crm/fields/record-fields";
import {
	InlineField,
	InlineSelectField,
	savingValue,
} from "@/components/crm/inline-field";
import { OwnerCell } from "@/components/crm/owner-cell";
import { CompanySocials } from "@/components/crm/social-links";
import { DealStageMenu } from "@/components/crm/stage-change";
import { Timeline } from "@/components/crm/timeline/timeline";
import { WebsiteActivity } from "@/components/crm/website-activity";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetMain,
	DetailSheetPending,
	DetailSheetProperties,
	DetailSheetProse,
	DetailSheetRail,
	DetailSheetSection,
	DetailSheetSplit,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
} from "@/components/detail-sheet";
import { LocalDay } from "@/components/local-date-time";
import { OPEN_STAGES } from "@/lib/deal-stage";
import { ENRICHMENT_POLL_MS, isEnriching } from "@/lib/enrichment-status";
import { savingField } from "@/lib/pending-field";
import { hasCompanyLinks } from "@/lib/social-links";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { QuickAddContact, QuickAddDeal } from "./quick-add";
import { RecordActions } from "./record-actions";
import {
	AddRow,
	DealAmount,
	DomainLink,
	MetaLine,
	RecordSheetFrame,
} from "./record-parts";
import { useOpenRecord, useRecordSheetView } from "./record-stack";

type Company = RouterOutputs["companies"]["byId"];
type CompanyDeal = Company["deals"][number];

const UNASSIGNED = "unassigned";

function pendingFields(
	company: Company,
	t: ReturnType<typeof useTranslations<"records">>,
): string[] {
	const missing: string[] = [];
	if (!company.industry) missing.push(t("companySheet.pending.industry"));
	if (!company.description) missing.push(t("companySheet.pending.description"));
	if (!hasCompanyLinks(company))
		missing.push(t("companySheet.pending.socialLinks"));
	return missing;
}

function companyConsequence(
	company: Company,
	t: ReturnType<typeof useTranslations<"records">>,
): string {
	const deals = company.deals.length;
	const contacts = company.contacts.length;

	const gone = t("companySheet.consequenceDeals", { count: deals });
	const kept = t("companySheet.consequenceContacts", { count: contacts });

	return gone + kept;
}

function useContactColumns(t: ReturnType<typeof useTranslations<"records">>) {
	return [
		{
			id: "primary",
			srLabel: t("companySheet.columns.primary"),
			width: "w-10",
			className: "pl-5",
		},
		{ id: "name", header: t("companySheet.columns.name"), width: "w-[28%]" },
		{ id: "title", header: t("companySheet.columns.title"), width: "w-[24%]" },
		{ id: "email", header: t("companySheet.columns.email"), width: "w-[26%]" },
		{ id: "owner", header: t("companySheet.columns.owner"), width: "w-[22%]" },
	];
}

function useDealColumns(t: ReturnType<typeof useTranslations<"records">>) {
	return [
		{
			id: "deal",
			header: t("companySheet.columns.deal"),
			width: "w-[32%]",
			className: "pl-5",
		},
		{ id: "stage", header: t("companySheet.columns.stage"), width: "w-[24%]" },
		{
			id: "amount",
			header: t("companySheet.columns.amount"),
			width: "w-[16%]",
			align: "right" as const,
		},
		{
			id: "close-date",
			header: t("companySheet.columns.closeDate"),
			width: "w-[14%]",
		},
		{ id: "owner", header: t("companySheet.columns.owner"), width: "w-[14%]" },
	];
}

function nextClose(deals: CompanyDeal[]): string | null {
	const dates = deals
		.map((deal) => deal.expectedCloseDate)
		.filter((date): date is string => date !== null)
		.sort();
	return dates[0] ?? null;
}

export function CompanySheet({ companyId }: { companyId: string }) {
	const trpc = useTRPC();
	const t = useTranslations("records");
	const {
		tab,
		setTab,
		form: adding,
		setForm: setAdding,
	} = useRecordSheetView("overview");

	const query = useQuery({
		...trpc.companies.byId.queryOptions({ id: companyId }),
		refetchInterval: (current) => {
			const record = current.state.data;
			return record && isEnriching(record.enrichmentStatus, record.queued)
				? ENRICHMENT_POLL_MS
				: false;
		},
	});

	const company = query.data;

	const location = company
		? [company.city, company.stateCode, company.country]
				.filter(Boolean)
				.join(", ")
		: null;

	const openDeals =
		company?.deals.filter((deal) => OPEN_STAGES.includes(deal.stage)) ?? [];
	const openValueCents = openDeals.reduce(
		(total, deal) => total + (deal.baseAmountCents ?? 0),
		0,
	);
	const openUncounted = openDeals.filter(
		(deal) => deal.amountCents !== null && deal.baseAmountCents === null,
	).length;
	const closing = nextClose(openDeals);

	const tabs: DetailSheetTab[] = company
		? [
				{
					value: "overview",
					label: t("companySheet.tabs.overview"),
					content: <CompanyOverview company={company} />,
				},
				{
					value: "contacts",
					label: t("companySheet.tabs.contacts"),
					count: company.contacts.length,
					content: (
						<CompanyContacts
							company={company}
							adding={adding === "contact"}
							onAdd={() => setAdding("contact")}
							onDone={() => setAdding(null)}
						/>
					),
				},
				{
					value: "deals",
					label: t("companySheet.tabs.deals"),
					count: company.deals.length,
					content: (
						<CompanyDeals
							company={company}
							adding={adding === "deal"}
							onAdd={() => setAdding("deal")}
							onDone={() => setAdding(null)}
						/>
					),
				},
				{
					value: "activity",
					label: t("companySheet.tabs.activity"),
					content: <Timeline anchor={{ companyId: company.id }} />,
				},
				{
					value: "agent",
					label: t("companySheet.tabs.agent"),
					content: <AgentPanel record={{ kind: "company", id: company.id }} />,
					keepMounted: true,
				},
			]
		: [];

	return (
		<RecordSheetFrame
			loading={query.isPending}
			error={query.error?.message ?? null}
			title={company?.name ?? t("companySheet.companyFallback")}
			description={
				company ? (
					<MetaLine
						lead={
							<DomainLink domain={company.domain} website={company.website} />
						}
						parts={[location, company.industry]}
					/>
				) : undefined
			}
			note={
				company && company.enrichmentStatus !== "COMPLETE" ? (
					<EnrichmentIndicator
						status={company.enrichmentStatus}
						queued={company.queued}
						title={company.enrichmentError}
					/>
				) : null
			}
			media={
				<EntityLogo
					src={company?.iconUrl ?? company?.logoUrl}
					darkSrc={company?.iconDarkUrl}
					tone={company?.iconTone as EntityLogoTone | null | undefined}
					name={company?.name ?? "?"}
					size="lg"
				/>
			}
			actions={
				company ? (
					<>
						<EnrichmentActions
							companyId={company.id}
							hasDomain={company.domain !== null}
						/>
						<RecordActions
							record={{ kind: "company", id: company.id }}
							name={company.name}
							consequence={companyConsequence(company, t)}
							archivedAt={company.archivedAt}
						/>
					</>
				) : null
			}
			stats={
				company ? (
					<DetailSheetStats>
						<DetailSheetStat label={t("companySheet.stats.openPipeline")}>
							<span className="tabular-nums">
								{formatMoney(openValueCents, company.reportingCurrency)}
							</span>
							{openUncounted > 0 ? (
								<span className="text-muted-foreground">
									{" "}
									{t("companySheet.stats.unconverted", {
										count: openUncounted,
									})}
								</span>
							) : null}
						</DetailSheetStat>
						<DetailSheetStat label={t("companySheet.stats.openDeals")}>
							<span className="tabular-nums">{openDeals.length}</span>
						</DetailSheetStat>
						<DetailSheetStat label={t("companySheet.stats.nextClose")}>
							{closing ? <LocalDay date={closing} /> : <EmptyCellValue />}
						</DetailSheetStat>
						<DetailSheetStat label={t("companySheet.stats.owner")}>
							<OwnerCell owner={company.owner} />
						</DetailSheetStat>
					</DetailSheetStats>
				) : null
			}
			tabs={tabs}
			tab={tab}
			onTabChange={setTab}
		/>
	);
}

function CompanyOverview({ company }: { company: Company }) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const t = useTranslations("records");

	const users = useQuery(trpc.users.list.queryOptions());

	const update = useMutation(
		trpc.companies.update.mutationOptions({
			onSuccess: () => cache.company(company.id, { settle: "record" }),
			onError: (error) => toast.error(error.message),
		}),
	);

	const save = (data: Record<string, string | null>) =>
		update.mutate({ id: company.id, data });

	const saveFields = (fields: Record<string, FieldValueJson>) =>
		update.mutate({ id: company.id, data: { fields } });

	const isSaving = savingField(update);
	const isSavingField = savingValue(update);

	return (
		<DetailSheetBody>
			<DetailSheetSplit>
				<DetailSheetMain>
					{company.description ? (
						<DetailSheetSection title={t("companySheet.about")}>
							<DetailSheetProse>{company.description}</DetailSheetProse>
						</DetailSheetSection>
					) : null}

					<WebsiteActivity companyId={company.id} />
				</DetailSheetMain>

				<DetailSheetRail>
					<DetailSheetSection
						title={t("companySheet.details")}
						action={<FieldsCog kind="company" />}
					>
						<DetailSheetProperties columns={1}>
							<InlineField
								label={t("companySheet.fields.name")}
								value={company.name}
								saving={isSaving("name")}
								onSave={(name) => name && save({ name })}
							/>
							<InlineField
								label={t("companySheet.fields.domain")}
								value={company.domain}
								type="url"
								placeholder="stripe.com"
								saving={isSaving("domain")}
								onSave={(domain) => save({ domain })}
							/>
							<InlineField
								label={t("companySheet.fields.website")}
								value={company.website}
								type="url"
								placeholder="https://stripe.com"
								saving={isSaving("website")}
								onSave={(website) => save({ website })}
							/>
							<InlineField
								label={t("companySheet.fields.phone")}
								value={company.phone}
								type="tel"
								saving={isSaving("phone")}
								onSave={(phone) => save({ phone })}
							/>
							<InlineField
								label={t("companySheet.fields.email")}
								value={company.email}
								type="email"
								saving={isSaving("email")}
								onSave={(email) => save({ email })}
							/>
							<InlineField
								label={t("companySheet.fields.city")}
								value={company.city}
								saving={isSaving("city")}
								onSave={(city) => save({ city })}
							/>
							<InlineField
								label={t("companySheet.fields.country")}
								value={company.country}
								saving={isSaving("country")}
								onSave={(country) => save({ country })}
							/>
							<InlineSelectField
								label={t("companySheet.fields.owner")}
								value={company.owner?.id ?? UNASSIGNED}
								options={[
									{ value: UNASSIGNED, label: t("fields.unassigned") },
									...(users.data ?? []).map((user) => ({
										value: user.id,
										label: user.name,
									})),
								]}
								onSave={(ownerId) =>
									save({ ownerId: ownerId === UNASSIGNED ? null : ownerId })
								}
							/>
							<RecordFields
								fields={company.fields}
								saving={isSavingField}
								onSave={saveFields}
							/>
						</DetailSheetProperties>
					</DetailSheetSection>

					<DetailSheetPending
						fields={pendingFields(company, t)}
						running={isEnriching(company.enrichmentStatus, company.queued)}
					/>

					{hasCompanyLinks(company) ? (
						<DetailSheetSection title={t("companySheet.links")}>
							<CompanySocials company={company} />
						</DetailSheetSection>
					) : null}
				</DetailSheetRail>
			</DetailSheetSplit>
		</DetailSheetBody>
	);
}

function CompanyContacts({
	company,
	adding,
	onAdd,
	onDone,
}: {
	company: Company;
	adding: boolean;
	onAdd: () => void;
	onDone: () => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();
	const t = useTranslations("records");
	const columns = useContactColumns(t);

	const setPrimary = useMutation(
		trpc.companies.setPrimaryContact.mutationOptions({
			onSuccess: () => cache.company(company.id),
			onError: (error) => toast.error(error.message),
		}),
	);

	const form = adding ? (
		<QuickAddContact
			companyId={company.id}
			ownerId={company.owner?.id ?? null}
			onDone={onDone}
		/>
	) : null;

	if (company.contacts.length === 0) {
		return (
			<>
				{form}
				{adding ? null : (
					<DetailSheetEmpty
						icon={UserMultiple}
						title={t("companySheet.noContacts.title")}
						description={t("companySheet.noContacts.description", {
							company: company.name,
						})}
						action={
							<Button variant="outline" size="sm" onClick={onAdd}>
								<Icon icon={Add} data-icon="inline-start" />
								{t("companySheet.addContact")}
							</Button>
						}
					/>
				)}
			</>
		);
	}

	return (
		<>
			{form}
			<SimpleTable variant="panel" columns={columns}>
				{company.contacts.map((contact) => {
					const isPrimary = contact.id === company.primaryContactId;
					return (
						<SimpleTableRow
							key={contact.id}
							clickable
							onClick={() => openRecord({ kind: "contact", id: contact.id })}
						>
							<TableCell className="w-10 py-2.5 pl-5">
								<Tooltip>
									<TooltipTrigger asChild>
										<Button
											variant="ghost"
											size="icon-xs"
											aria-pressed={isPrimary}
											disabled={isPrimary || setPrimary.isPending}
											onClick={(event) => {
												event.stopPropagation();
												setPrimary.mutate({
													companyId: company.id,
													contactId: contact.id,
												});
											}}
										>
											<Icon icon={isPrimary ? StarFilled : Star} />
											<span className="sr-only">
												{isPrimary
													? t("companySheet.primaryContact")
													: t("companySheet.makePrimary")}
											</span>
										</Button>
									</TooltipTrigger>
									<TooltipContent>
										{isPrimary
											? t("companySheet.primaryContact")
											: t("companySheet.makePrimary")}
									</TooltipContent>
								</Tooltip>
							</TableCell>
							<TableCell className="truncate px-3 py-2.5 font-medium">
								<span className="flex min-w-0 items-center gap-2">
									<PersonAvatar
										src={contact.imageUrl}
										name={[contact.firstName, contact.lastName]
											.filter(Boolean)
											.join(" ")}
										email={contact.email}
										size="sm"
									/>
									<span className="truncate">
										{[contact.firstName, contact.lastName]
											.filter(Boolean)
											.join(" ")}
									</span>
								</span>
							</TableCell>
							<TableCell className="truncate px-3 py-2.5">
								{contact.title ?? <EmptyCellValue />}
							</TableCell>
							<TableCell className="truncate px-3 py-2.5 text-muted-foreground">
								{contact.email ?? <EmptyCellValue />}
							</TableCell>
							<TableCell className="px-3 py-2.5">
								<OwnerCell owner={contact.owner} />
							</TableCell>
						</SimpleTableRow>
					);
				})}

				<AddRow
					label={t("companySheet.addContact")}
					columns={columns.length}
					onClick={onAdd}
				/>
			</SimpleTable>
		</>
	);
}

function CompanyDeals({
	company,
	adding,
	onAdd,
	onDone,
}: {
	company: Company;
	adding: boolean;
	onAdd: () => void;
	onDone: () => void;
}) {
	const openRecord = useOpenRecord();
	const t = useTranslations("records");
	const columns = useDealColumns(t);

	const form = adding ? (
		<QuickAddDeal
			companyId={company.id}
			companyName={company.name}
			ownerId={company.owner?.id ?? null}
			onDone={onDone}
		/>
	) : null;

	if (company.deals.length === 0) {
		return (
			<>
				{form}
				{adding ? null : (
					<DetailSheetEmpty
						icon={Partnership}
						title={t("companySheet.noDeals.title")}
						description={t("companySheet.noDeals.description", {
							company: company.name,
						})}
						action={
							<Button variant="outline" size="sm" onClick={onAdd}>
								<Icon icon={Add} data-icon="inline-start" />
								{t("companySheet.newDeal")}
							</Button>
						}
					/>
				)}
			</>
		);
	}

	return (
		<>
			{form}
			<SimpleTable variant="panel" columns={columns}>
				{company.deals.map((deal) => (
					<SimpleTableRow
						key={deal.id}
						clickable
						onClick={() => openRecord({ kind: "deal", id: deal.id })}
					>
						<TableCell className="truncate py-2.5 pr-3 pl-5 font-medium">
							{deal.name}
						</TableCell>
						<TableCell className="px-3 py-2.5">
							<DealStageMenu dealId={deal.id} stage={deal.stage} />
						</TableCell>
						<TableCell className="px-3 py-2.5 text-right">
							<DealAmount
								amountCents={deal.amountCents}
								currency={deal.currency}
							/>
						</TableCell>
						<TableCell className="px-3 py-2.5 text-muted-foreground">
							{deal.expectedCloseDate ? (
								<LocalDay date={deal.expectedCloseDate} />
							) : (
								<EmptyCellValue />
							)}
						</TableCell>
						<TableCell className="px-3 py-2.5">
							<OwnerCell owner={deal.owner} />
						</TableCell>
					</SimpleTableRow>
				))}

				<AddRow
					label={t("companySheet.newDeal")}
					columns={columns.length}
					onClick={onAdd}
				/>
			</SimpleTable>
		</>
	);
}
