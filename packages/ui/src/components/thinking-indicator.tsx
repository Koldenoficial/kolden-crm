import { translator } from "@crm/i18n/translator";
import { DotMatrix } from "@crm/ui/components/dot-matrix";
import { Shimmer } from "@crm/ui/components/shimmer";
import { cn } from "@crm/ui/lib/utils";

export function ThinkingIndicator({
	label,
	className,
}: {
	label?: string;
	className?: string;
}) {
	const t = translator("ui");
	return (
		<div className={cn("flex min-w-0 items-center gap-2 text-sm", className)}>
			<DotMatrix decorative />
			<Shimmer className="text-muted-foreground">
				{label ?? t("thinkingIndicator.label")}
			</Shimmer>
		</div>
	);
}
