import { afterEach, describe, expect, it } from "bun:test";
import { languageInstructions } from "../agent/lib/language-rule";

const ORIGINAL_LOCALE = process.env.CRM_LOCALE;

afterEach(() => {
	if (ORIGINAL_LOCALE === undefined) {
		delete process.env.CRM_LOCALE;
	} else {
		process.env.CRM_LOCALE = ORIGINAL_LOCALE;
	}
});

describe("the agent's language rule", () => {
	it("adds nothing when the install speaks English", () => {
		process.env.CRM_LOCALE = "en";
		expect(languageInstructions()).toBe("");
	});

	it("adds nothing when CRM_LOCALE is unset", () => {
		delete process.env.CRM_LOCALE;
		expect(languageInstructions()).toBe("");
	});

	it("asks for Brazilian Portuguese prose, evidence and ids excluded", () => {
		process.env.CRM_LOCALE = "pt-BR";
		const rule = languageInstructions();

		expect(rule).toContain("Brazilian Portuguese");
		expect(rule).toContain("stays in the language it was written in");
		expect(rule).toContain("never translated");
	});
});
