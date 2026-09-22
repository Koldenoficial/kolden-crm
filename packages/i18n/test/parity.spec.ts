import { describe, expect, test } from "bun:test";
import { LOCALES } from "../src/index";
import { allMessages } from "../src/messages";

type Tree = { [key: string]: string | Tree };

function isBranch(value: string | Tree): value is Tree {
	return value instanceof Object;
}

function leaves(tree: Tree, prefix = ""): Map<string, string> {
	const out = new Map<string, string>();
	for (const [key, value] of Object.entries(tree)) {
		const path = prefix ? `${prefix}.${key}` : key;
		if (isBranch(value))
			for (const [k, v] of leaves(value, path)) out.set(k, v);
		else out.set(path, value);
	}
	return out;
}

function argumentsOf(message: string): string[] {
	const names = new Set<string>();
	let i = 0;

	function skipSpace() {
		while (i < message.length && /\s/.test(message.charAt(i))) i++;
	}

	function word(): string {
		skipSpace();
		const begin = i;
		while (i < message.length && /[^\s,{}]/.test(message.charAt(i))) i++;
		return message.slice(begin, i);
	}

	function text(): void {
		while (i < message.length) {
			const char = message.charAt(i);
			if (char === "}") return;
			if (char === "{") {
				i++;
				argument();
			} else i++;
		}
	}

	function block(): void {
		skipSpace();
		if (message.charAt(i) !== "{") return;
		i++;
		text();
		i++;
	}

	function argument(): void {
		const name = word();
		if (name) names.add(name);
		skipSpace();
		if (message.charAt(i) === "}") {
			i++;
			return;
		}
		i++;
		const type = word();
		skipSpace();
		if (["plural", "select", "selectordinal"].includes(type)) {
			if (message.charAt(i) === ",") i++;
			for (;;) {
				skipSpace();
				if (i >= message.length || message.charAt(i) === "}") break;
				word();
				block();
			}
			i++;
			return;
		}
		let depth = 1;
		while (i < message.length && depth > 0) {
			if (message.charAt(i) === "{") depth++;
			if (message.charAt(i) === "}") depth--;
			i++;
		}
	}

	text();
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

describe("argumentsOf", () => {
	test("reads plain arguments", () => {
		expect(argumentsOf("Showing {start}–{end} of {total}")).toEqual([
			"end",
			"start",
			"total",
		]);
	});

	test("does not read plural branch text as an argument", () => {
		expect(
			argumentsOf("{count, plural, =0 {Nothing} one {it} other {Enriching}}"),
		).toEqual(["count"]);
	});

	test("reads arguments nested inside a branch", () => {
		expect(
			argumentsOf("{count, plural, one {# of {name}} other {# in {place}}}"),
		).toEqual(["count", "name", "place"]);
	});

	test("reads typed arguments", () => {
		expect(argumentsOf("<link>{name}</link> has {n, number} items")).toEqual([
			"n",
			"name",
		]);
	});
});
