import { defineInstructions } from "eve/instructions";
import { languageInstructions } from "../../../lib/language-rule";

export default defineInstructions({
	markdown: languageInstructions(),
});
