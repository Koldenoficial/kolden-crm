import type { Db } from "@crm/db";
import { translator } from "@crm/i18n/translator";
import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export const MAX_BULK_IDS = 100;

export const bulkIdsInput = z.object({
	ids: z
		.array(z.string())
		.min(1, { error: () => translator("api")("bulk.nothingSelected") })
		.max(MAX_BULK_IDS, {
			error: () => translator("api")("bulk.tooManyAtOnce"),
		}),
});

export type BulkResult = {
	requested: number;
	succeeded: number;
	skipped: number;
	failed: number;
	message: string | null;
};

export async function requireOwner(
	db: Db,
	ownerId: string | null,
): Promise<void> {
	if (!ownerId) return;

	const owner = await db.user.findUnique({
		where: { id: ownerId },
		select: { id: true },
	});

	if (!owner) {
		throw new BadRequestException(translator("api")("bulk.ownerGone"));
	}
}

export async function runBulk(
	ids: string[],
	act: (id: string) => Promise<unknown>,
): Promise<BulkResult> {
	const unique = [...new Set(ids)];
	let succeeded = 0;
	let skipped = 0;
	let message: string | null = null;

	for (const id of unique) {
		try {
			const outcome = await act(id);
			if (outcome === null) {
				skipped += 1;
			} else {
				succeeded += 1;
			}
		} catch (error) {
			message ??=
				error instanceof Error
					? error.message
					: translator("api")("bulk.somethingWentWrong");
		}
	}

	return {
		requested: unique.length,
		succeeded,
		skipped,
		failed: unique.length - succeeded - skipped,
		message,
	};
}
