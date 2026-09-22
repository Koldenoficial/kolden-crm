import { translator } from "@crm/i18n/translator";
import type { FieldEntity } from "./fields-entity";

export function standardFieldsFor(entity: FieldEntity): readonly string[] {
	const t = translator("records");
	switch (entity) {
		case "COMPANY":
			return [
				t("fields.standardField.name"),
				t("fields.standardField.domain"),
				t("fields.standardField.website"),
				t("fields.standardField.phone"),
				t("fields.standardField.email"),
				t("fields.standardField.city"),
				t("fields.standardField.country"),
				t("fields.standardField.owner"),
			];
		case "CONTACT":
			return [
				t("fields.standardField.firstName"),
				t("fields.standardField.lastName"),
				t("fields.standardField.title"),
				t("fields.standardField.email"),
				t("fields.standardField.phone"),
				t("fields.standardField.linkedin"),
				t("fields.standardField.github"),
				t("fields.standardField.company"),
				t("fields.standardField.owner"),
			];
		case "DEAL":
			return [
				t("fields.standardField.name"),
				t("fields.standardField.amount"),
				t("fields.standardField.currency"),
				t("fields.standardField.closeDate"),
				t("fields.standardField.company"),
				t("fields.standardField.owner"),
				t("fields.standardField.stage"),
			];
	}
}
