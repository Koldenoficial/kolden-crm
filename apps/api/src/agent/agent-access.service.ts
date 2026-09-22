import {
	isWorkspaceAdmin,
	toWorkspaceRole,
	WORKSPACE_ID,
	type WorkspaceRole,
	workspaceRoleOf,
} from "@crm/auth";
import type { Db, Prisma } from "@crm/db";
import { translator } from "@crm/i18n/translator";
import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { InjectDatabase } from "../database/database.constants";
import { canReadAgent, isPrivateAgentDraft } from "./agent-visibility";

@Injectable()
export class AgentAccessService {
	constructor(@InjectDatabase() private readonly db: Db) {}

	async assertMember(userId: string): Promise<WorkspaceRole> {
		const role = await workspaceRoleOf(userId);

		if (!role) {
			throw new ForbiddenException(translator("api")("agents.notAMember"));
		}

		return role;
	}

	async assertCanManageInTransaction(
		tx: Prisma.TransactionClient,
		agentId: string,
		userId: string,
	) {
		const [member] = await tx.$queryRaw<Array<{ role: string }>>`
			SELECT role
			FROM "member"
			WHERE "organizationId" = ${WORKSPACE_ID}
				AND "userId" = ${userId}
			FOR SHARE
		`;

		const t = translator("api");

		if (!member) {
			throw new ForbiddenException(t("agents.notAMember"));
		}

		const role = toWorkspaceRole(member.role);
		const agent = await tx.agentDefinition.findFirst({
			where: { id: agentId, status: { not: "DELETED" } },
			select: {
				id: true,
				createdById: true,
				status: true,
				name: true,
				description: true,
			},
		});

		if (!agent) {
			throw new NotFoundException(t("agents.notFound", { id: agentId }));
		}

		if (isPrivateAgentDraft(agent.status) && agent.createdById !== userId) {
			throw new NotFoundException(t("agents.notFound", { id: agentId }));
		}

		if (agent.createdById !== userId && !isWorkspaceAdmin(role)) {
			throw new ForbiddenException(t("agents.forbiddenChange"));
		}

		return agent;
	}

	async assertCanRead(agentId: string, userId: string) {
		const role = await this.assertMember(userId);
		const agent = await this.db.agentDefinition.findFirst({
			where: { id: agentId, status: { not: "DELETED" } },
			select: {
				id: true,
				createdById: true,
				status: true,
				currentVersionId: true,
			},
		});

		if (!agent || !canReadAgent(agent.status, agent.createdById, userId)) {
			throw new NotFoundException(
				translator("api")("agents.notFound", { id: agentId }),
			);
		}

		return {
			...agent,
			role,
			canManage: agent.createdById === userId || isWorkspaceAdmin(role),
		};
	}
}
