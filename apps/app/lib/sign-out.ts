"use client";

import { signOut } from "@crm/auth/client";
import { translator } from "@crm/i18n/translator";
import { toast } from "sonner";

export async function signOutAndRedirect() {
	const { error } = await signOut();

	if (error) {
		const t = translator("shell");
		toast.error(error.message ?? t("signOutError"));
		return;
	}

	window.location.assign("/sign-in");
}
