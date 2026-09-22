import { describe, expect, test } from "bun:test";
import { LOCALES } from "../src/index";
import { allMessages } from "../src/messages";

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): Map<string, string> {
	const out = new Map<string, string>();
	for (const [key, value] of Object.entries(tree)) {
		const path = prefix ? `${prefix}.${key}` : key;
		if (typeof value === "string") out.set(path, value);
		else for (const [k, v] of leaves(value, path)) out.set(k, v);
	}
	return out;
}

function argumentsOf(message: string): string[] {
	const names = new Set<string>();
	for (const match of message.matchAll(/\{\s*([A-Za-z_][\w]*)\s*[,}]/g)) {
		if (match[1]) names.add(match[1]);
	}
	return [...names].sort();
}

const english = leaves(allMessages.en as unknown as Tree);

describe("every locale says what English says", () => {
	for (const locale of LOCALES.filter((l) => l !== "en")) {
		const other = leaves(allMessages[locale] as unknown as Tree);

		test(`${locale} has every English key`, () => {
			const missing = [...english.keys()].filter((key) => !other.has(key));
			expect(missing).toEqual([]);
		});

		test(`${locale} has no key English lacks`, () => {
			const extra = [...other.keys()].filter((key) => !english.has(key));
			expect(extra).toEqual([]);
		});

		test(`${locale} interpolates the same arguments`, () => {
			const drift = [...english].flatMap(([key, source]) => {
				const target = other.get(key);
				if (target === undefined) return [];
				const a = argumentsOf(source).join(",");
				const b = argumentsOf(target).join(",");
				return a === b ? [] : [`${key}: {${a}} vs {${b}}`];
			});
			expect(drift).toEqual([]);
		});
	}
});

describe("house style", () => {
	test("pt-BR copy uses no em dash as punctuation", () => {
		const offenders = [...leaves(allMessages["pt-BR"] as unknown as Tree)]
			.filter(([, value]) => value.trim() !== "—" && value.includes("—"))
			.map(([key]) => key);
		expect(offenders).toEqual([]);
	});
});
