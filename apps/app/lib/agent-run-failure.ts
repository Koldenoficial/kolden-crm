import { translator } from "@crm/i18n/translator";

const REASON_KEYS: Record<string, string> = {
	ACTION_NOT_PERFORMED: "runFailure.reasons.actionNotPerformed",
	NO_EXECUTOR: "runFailure.reasons.noExecutor",
	DEPENDENCY_UNAVAILABLE: "runFailure.reasons.dependencyUnavailable",
	NOT_AUTHORISED: "runFailure.reasons.notAuthorised",
	PROVIDER_ERROR: "runFailure.reasons.providerError",
	NEVER_SETTLED: "runFailure.reasons.neverSettled",
	TURN_FAILED: "runFailure.reasons.turnFailed",
	DELIVERY_FAILED: "runFailure.reasons.deliveryFailed",
	DELIVERY_EXHAUSTED: "runFailure.reasons.deliveryExhausted",
	ACTION_REJECTED: "runFailure.reasons.actionRejected",
	AGENT_UNAVAILABLE: "runFailure.reasons.agentUnavailable",
	AGENT_DELETED: "runFailure.reasons.agentDeleted",
	CANCELLED_BY_USER: "runFailure.reasons.cancelledByUser",
	RUN_TIMED_OUT: "runFailure.reasons.runTimedOut",
};

export function runFailureReason(
	code: string | null | undefined,
	message: string | null | undefined,
): string {
	const t = translator("agentBuilder");
	const key = code ? REASON_KEYS[code] : undefined;
	if (key) return t(key as Parameters<typeof t>[0]);
	if (message?.trim()) return message.trim();
	return t("runFailure.unknown");
}
