"use client";

import Building from "@carbon/icons-react/es/Building";
import Close from "@carbon/icons-react/es/Close";
import Dashboard from "@carbon/icons-react/es/Dashboard";
import Partnership from "@carbon/icons-react/es/Partnership";
import Settings from "@carbon/icons-react/es/Settings";
import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Button } from "@crm/ui/components/button";
import type { CarbonIcon } from "@crm/ui/components/icon";
import { Icon } from "@crm/ui/components/icon";
import Bot from "@crm/ui/components/icons/bot";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { cn } from "@crm/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { AgentBuilderSidebar } from "@/components/agent-builder/agent-builder-sidebar";
import { usePrefetchSection } from "@/components/crm/section-prefetch";
import { useMobileNav } from "@/components/mobile-nav";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

type RailItemId =
	| "overview"
	| "chat"
	| "companies"
	| "contacts"
	| "deals"
	| "settings";

type RailItemDef = {
	id: RailItemId;
	href: string;
	icon: CarbonIcon;
	iconClassName?: string;
	match: "exact" | "prefix";
	related?: string[];
};

type RailItem = RailItemDef & { title: string; section: string };

const ITEM_DEFS: RailItemDef[] = [
	{ id: "overview", href: "/", icon: Dashboard, match: "exact" },
	{
		id: "chat",
		href: "/chat",
		icon: Bot,
		iconClassName: "size-5",
		match: "prefix",
		related: ["/agents"],
	},
	{ id: "companies", href: "/companies", icon: Building, match: "prefix" },
	{
		id: "contacts",
		href: "/contacts",
		icon: UserMultiple,
		match: "prefix",
	},
	{ id: "deals", href: "/deals", icon: Partnership, match: "prefix" },
	{ id: "settings", href: "/settings", icon: Settings, match: "prefix" },
];

const NAV_LABEL_KEY = {
	overview: "nav.overview",
	chat: "nav.chat",
	companies: "nav.companies",
	contacts: "nav.contacts",
	deals: "nav.deals",
	settings: "nav.settings",
} as const;

function isActive(item: RailItem, pathname: string): boolean {
	return (
		pathname === item.href ||
		(item.match === "prefix" && pathname.startsWith(item.href)) ||
		Boolean(item.related?.some((prefix) => pathname.startsWith(prefix)))
	);
}

function RailLink({
	item,
	active,
	onPrefetch,
}: {
	item: RailItem;
	active: boolean;
	onPrefetch: () => void;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					asChild
					variant="ghost"
					size="icon"
					className={cn(
						"text-muted-foreground",
						active &&
							"bg-muted text-foreground hover:bg-muted hover:text-foreground",
					)}
				>
					<Link
						href={item.href}
						prefetch
						onMouseEnter={onPrefetch}
						onFocus={onPrefetch}
						aria-current={active ? "page" : undefined}
						transitionTypes={["nav-lateral"]}
					>
						<Icon icon={item.icon} className={item.iconClassName} />
						<span className="sr-only">{item.title}</span>
					</Link>
				</Button>
			</TooltipTrigger>
			<TooltipContent side="right">{item.title}</TooltipContent>
		</Tooltip>
	);
}

function MobileRailLink({
	item,
	active,
	onNavigate,
	onPrefetch,
}: {
	item: RailItem;
	active: boolean;
	onNavigate: () => void;
	onPrefetch: () => void;
}) {
	return (
		<Button
			asChild
			variant="ghost"
			className={cn(
				"justify-start gap-3 text-muted-foreground",
				active &&
					"bg-muted text-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			<Link
				href={item.href}
				prefetch
				onMouseEnter={onPrefetch}
				onFocus={onPrefetch}
				aria-current={active ? "page" : undefined}
				onClick={onNavigate}
				transitionTypes={[item.id === "chat" ? "nav-forward" : "nav-lateral"]}
			>
				<Icon icon={item.icon} className={item.iconClassName} />
				<span>{item.title}</span>
			</Link>
		</Button>
	);
}

function MobileRailIconLink({
	item,
	active,
	onNavigate,
	onPrefetch,
}: {
	item: RailItem;
	active: boolean;
	onNavigate: () => void;
	onPrefetch: () => void;
}) {
	return (
		<Button
			asChild
			variant="ghost"
			size="icon"
			className={cn(
				"text-muted-foreground",
				active &&
					"bg-muted text-foreground hover:bg-muted hover:text-foreground",
			)}
		>
			<Link
				href={item.href}
				prefetch
				onMouseEnter={onPrefetch}
				onFocus={onPrefetch}
				aria-current={active ? "page" : undefined}
				onClick={onNavigate}
			>
				<Icon icon={item.icon} className={item.iconClassName} />
				<span className="sr-only">{item.title}</span>
			</Link>
		</Button>
	);
}

export function AppIconRailFallback() {
	const t = useTranslations("shell");

	return (
		<nav
			aria-label={t("nav.primary")}
			aria-busy="true"
			className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex [view-transition-name:app-rail]"
		>
			{ITEM_DEFS.map((item) => (
				<Button
					key={item.href}
					variant="ghost"
					size="icon"
					disabled
					className="text-muted-foreground"
				>
					<Icon icon={item.icon} className={item.iconClassName} />
					<span className="sr-only">{t(NAV_LABEL_KEY[item.id])}</span>
				</Button>
			))}
		</nav>
	);
}

export function AppIconRail() {
	const t = useTranslations("shell");
	const pathname = usePathname();
	const workspaceUrl = useWorkspaceUrl();
	const { open, setOpen } = useMobileNav();
	const prefetchSection = usePrefetchSection();

	const items = useMemo(
		() =>
			ITEM_DEFS.map((item) => ({
				...item,
				title: t(NAV_LABEL_KEY[item.id]),
				section: item.href,
				href: workspaceUrl(item.href),
				related: item.related?.map((path) => workspaceUrl(path)),
			})),
		[t, workspaceUrl],
	);
	const inChat = items.some(
		(item) => item.id === "chat" && isActive(item, pathname),
	);

	return (
		<>
			<nav
				aria-label={t("nav.primary")}
				className="hidden w-14 shrink-0 flex-col items-center gap-1 border-r py-3 md:flex [view-transition-name:app-rail]"
			>
				{items.map((item) => (
					<RailLink
						key={item.href}
						item={item}
						active={isActive(item, pathname)}
						onPrefetch={() => prefetchSection(item.section)}
					/>
				))}
			</nav>

			<Sheet open={open} onOpenChange={setOpen}>
				{inChat ? (
					<SheetContent
						side="left"
						showCloseButton={false}
						className="w-5/6 max-w-sm flex-row gap-0 p-0"
					>
						<SheetHeader className="sr-only">
							<SheetTitle>{t("nav.navigationAndChats")}</SheetTitle>
						</SheetHeader>
						<nav
							aria-label={t("nav.primary")}
							className="flex w-14 shrink-0 flex-col items-center gap-1 border-r py-3"
						>
							<Button
								variant="ghost"
								size="icon"
								aria-label={t("nav.closeNavigation")}
								onClick={() => setOpen(false)}
							>
								<Icon icon={Close} />
							</Button>
							<div className="my-1 h-px w-5 bg-border" />
							{items.map((item) => (
								<MobileRailIconLink
									key={item.href}
									item={item}
									active={isActive(item, pathname)}
									onNavigate={() => setOpen(false)}
									onPrefetch={() => prefetchSection(item.section)}
								/>
							))}
						</nav>
						<AgentBuilderSidebar
							className="flex flex-1"
							onNavigate={() => setOpen(false)}
						/>
					</SheetContent>
				) : (
					<SheetContent side="left" className="w-64 gap-0 p-0">
						<SheetHeader>
							<SheetTitle>{t("nav.navigation")}</SheetTitle>
						</SheetHeader>
						<nav
							aria-label={t("nav.primary")}
							className="flex flex-1 flex-col gap-1 p-2"
						>
							{items.map((item) => (
								<MobileRailLink
									key={item.href}
									item={item}
									active={isActive(item, pathname)}
									onNavigate={() => setOpen(false)}
									onPrefetch={() => prefetchSection(item.section)}
								/>
							))}
						</nav>
					</SheetContent>
				)}
			</Sheet>
		</>
	);
}
