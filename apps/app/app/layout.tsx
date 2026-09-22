import "@crm/ui/globals.css";
import { appLocale } from "@crm/i18n";
import { Toaster } from "@crm/ui/components/sonner";
import { TooltipProvider } from "@crm/ui/components/tooltip";
import { cn } from "@crm/ui/lib/utils";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { LocalDateTimeHydrator } from "@/components/local-date-time";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/lib/trpc/client";

const fontSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const fontMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("shell.meta");
	return {
		title: {
			default: "Comp AI - CRM",
			template: "%s · Comp AI CRM",
		},
		description: t("description"),
		icons: {
			icon: [
				{ url: "/favicon.svg", type: "image/svg+xml" },
				{ url: "/favicon-96x96.png", type: "image/png", sizes: "96x96" },
			],
			apple: "/apple-touch-icon.png",
		},
		manifest: "/site.webmanifest",
	};
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang={appLocale()}
			suppressHydrationWarning
			className={cn(fontSans.variable, fontMono.variable, "h-full antialiased")}
		>
			<body className="flex min-h-full flex-col font-sans">
				<NextIntlClientProvider>
					<NuqsAdapter>
						<TRPCReactProvider>
							<ThemeProvider>
								<TooltipProvider>{children}</TooltipProvider>
								<Toaster richColors />
							</ThemeProvider>
						</TRPCReactProvider>
					</NuqsAdapter>
				</NextIntlClientProvider>
				<LocalDateTimeHydrator />
			</body>
		</html>
	);
}
