"use client";

import Archive from "@carbon/icons-react/es/Archive";
import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import Undo from "@carbon/icons-react/es/Undo";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crm/ui/components/alert-dialog";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import {
	type RecordKind,
	type RecordRef,
	useRecordStack,
} from "./record-stack";

const RECORD_PROCEDURES = {
	company: "companies",
	contact: "contacts",
	deal: "deals",
} satisfies Record<RecordKind, "companies" | "contacts" | "deals">;

function nounFor(
	t: ReturnType<typeof useTranslations<"records">>,
	kind: RecordKind,
): string {
	return t(`recordActions.noun.${kind}`);
}

function fallbackName(
	t: ReturnType<typeof useTranslations<"records">>,
	kind: RecordKind,
): string {
	return t(`recordActions.theNoun.${kind}`);
}

function useArchiveRecord(
	record: RecordRef,
	t: ReturnType<typeof useTranslations<"records">>,
) {
	const trpc = useTRPC();
	const cache = useCrmCache();

	const handlers = {
		onSuccess: (archived: { name: string }) => {
			toast.success(
				t(`recordActions.archived.${record.kind}`, {
					name: archived.name || fallbackName(t, record.kind),
				}),
			);
			void cache[record.kind](record.id);
		},
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return useMutation(
		trpc[RECORD_PROCEDURES[record.kind]].archive.mutationOptions(handlers),
	);
}

function useRestoreRecord(
	record: RecordRef,
	t: ReturnType<typeof useTranslations<"records">>,
) {
	const trpc = useTRPC();
	const cache = useCrmCache();

	const handlers = {
		onSuccess: (restored: { name: string }) => {
			toast.success(
				t(`recordActions.restored.${record.kind}`, {
					name: restored.name || fallbackName(t, record.kind),
				}),
			);
			void cache[record.kind](record.id);
		},
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return useMutation(
		trpc[RECORD_PROCEDURES[record.kind]].restore.mutationOptions(handlers),
	);
}

function usePurgeRecord(
	record: RecordRef,
	t: ReturnType<typeof useTranslations<"records">>,
) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { close } = useRecordStack();

	const handlers = {
		onSuccess: (purged: { name: string }) => {
			toast.success(
				t(`recordActions.deletedForever.${record.kind}`, {
					name: purged.name || fallbackName(t, record.kind),
				}),
			);
			void cache.removed(record);
			close();
		},
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return useMutation(
		trpc[RECORD_PROCEDURES[record.kind]].purge.mutationOptions(handlers),
	);
}

export function RecordActions({
	record,
	name,
	consequence,
	archivedAt,
}: {
	record: RecordRef;
	name: string;
	consequence: string;
	archivedAt: string | null;
}) {
	const [confirming, setConfirming] = useState(false);
	const t = useTranslations("records");
	const archive = useArchiveRecord(record, t);
	const restore = useRestoreRecord(record, t);
	const purge = usePurgeRecord(record, t);

	const pending = archive.isPending || restore.isPending || purge.isPending;
	const noun = nounFor(t, record.kind);

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon-sm" disabled={pending}>
						<Icon icon={OverflowMenuVertical} />
						<span className="sr-only">{t("recordActions.moreActions")}</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="min-w-44">
					{archivedAt ? (
						<>
							<DropdownMenuItem
								onSelect={() => restore.mutate({ id: record.id })}
							>
								<Icon icon={Undo} />
								{t("recordActions.restoreNoun", { noun })}
							</DropdownMenuItem>
							<DropdownMenuItem
								variant="destructive"
								onSelect={() => setConfirming(true)}
							>
								<Icon icon={TrashCan} />
								{t("recordActions.deleteNounForever", { noun })}
							</DropdownMenuItem>
						</>
					) : (
						<DropdownMenuItem
							onSelect={() => archive.mutate({ id: record.id })}
						>
							<Icon icon={Archive} />
							{t("recordActions.archiveNoun", { noun })}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>

			<AlertDialog open={confirming} onOpenChange={setConfirming}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							{t("recordActions.deleteForeverTitle", { name })}
						</AlertDialogTitle>
						<AlertDialogDescription>{consequence}</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={() => purge.mutate({ id: record.id })}
						>
							{t("recordActions.deleteForever")}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
