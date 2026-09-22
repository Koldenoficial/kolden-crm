"use client";

import MagicWand from "@carbon/icons-react/es/MagicWand";
import Renew from "@carbon/icons-react/es/Renew";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export function EnrichmentActions({
	companyId,
	hasDomain,
}: {
	companyId: string;
	hasDomain: boolean;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const t = useTranslations("records");

	const enrich = useMutation(
		trpc.companies.enrich.mutationOptions({
			onSuccess: async (result) => {
				await cache.company(companyId);
				toast.success(
					result.queued
						? t("enrichmentActions.lookingUp")
						: t("enrichmentActions.alreadyRunning"),
				);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const research = useMutation(
		trpc.companies.research.mutationOptions({
			onSuccess: async (result) => {
				await cache.activity();
				toast.success(
					result.queued
						? t("enrichmentActions.researching")
						: t("enrichmentActions.alreadyResearching"),
				);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				disabled={!hasDomain || enrich.isPending}
				onClick={() => enrich.mutate({ id: companyId })}
			>
				{enrich.isPending ? (
					<Spinner />
				) : (
					<Icon icon={Renew} data-icon="inline-start" />
				)}
				<span className="hidden sm:inline">
					{t("enrichmentActions.reEnrich")}
				</span>
			</Button>

			<Button
				size="sm"
				disabled={!hasDomain || research.isPending}
				onClick={() => research.mutate({ id: companyId })}
			>
				{research.isPending ? (
					<Spinner />
				) : (
					<Icon icon={MagicWand} data-icon="inline-start" />
				)}
				<span className="hidden sm:inline">
					{t("enrichmentActions.research")}
				</span>
			</Button>
		</>
	);
}

export function ContactEnrichmentAction({ contactId }: { contactId: string }) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const t = useTranslations("records");

	const enrich = useMutation(
		trpc.contacts.enrich.mutationOptions({
			onSuccess: async (result) => {
				await cache.contact(contactId);
				toast.success(
					result.queued
						? t("enrichmentActions.takingAnotherLook")
						: t("enrichmentActions.alreadyRunning"),
				);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Button
			variant="outline"
			size="sm"
			disabled={enrich.isPending}
			onClick={() => enrich.mutate({ id: contactId })}
		>
			{enrich.isPending ? (
				<Spinner />
			) : (
				<Icon icon={Renew} data-icon="inline-start" />
			)}
			<span className="hidden sm:inline">
				{t("enrichmentActions.reEnrich")}
			</span>
		</Button>
	);
}
