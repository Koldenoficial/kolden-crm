"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@crm/ui/components/accordion";
import { Shimmer } from "@crm/ui/components/shimmer";
import { cn } from "@crm/ui/lib/utils";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export function Reasoning({
	children,
	className,
	isStreaming = false,
	label,
}: {
	children: ReactNode;
	className?: string;
	isStreaming?: boolean;
	label?: string;
}) {
	const t = useTranslations("ui");
	const resolvedLabel = label ?? t("reasoning.label");
	return (
		<Accordion
			key={isStreaming ? "streaming" : "settled"}
			type="single"
			collapsible
			defaultValue={isStreaming ? "reasoning" : undefined}
			className={cn(className)}
		>
			<AccordionItem value="reasoning">
				<AccordionTrigger variant="subtle">
					{isStreaming ? (
						<Shimmer>{t("reasoning.streaming")}</Shimmer>
					) : (
						resolvedLabel
					)}
				</AccordionTrigger>
				<AccordionContent className="text-muted-foreground">
					{children}
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
