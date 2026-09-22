import { translator } from "@crm/i18n/translator";
import {
	BadRequestException,
	Injectable,
	Logger,
	ServiceUnavailableException,
} from "@nestjs/common";
import { bridge } from "../agent/bridge";
import { slackCreateChannelReply } from "./slack.contracts";

const CREATE_TIMEOUT_MS = 20_000;

const SERVER_ERROR_STATUS = 500;

@Injectable()
export class SlackChannelsService {
	private readonly logger = new Logger(SlackChannelsService.name);

	async create(name: string, isPrivate: boolean) {
		const agent = bridge();
		const t = translator("api");

		if (!agent) {
			throw new ServiceUnavailableException(t("slack.noBridgeSecret"));
		}

		let response: Response;

		try {
			response = await fetch(agent.url("/internal/crm/slack/create-channel"), {
				method: "POST",
				headers: {
					authorization: `Bearer ${agent.secret}`,
					"content-type": "application/json",
				},
				body: JSON.stringify({
					type: "slack.channel.create",
					channelName: name,
					isPrivate,
				}),
				signal: AbortSignal.timeout(CREATE_TIMEOUT_MS),
			});
		} catch (error) {
			this.logger.error(
				{ message: "Could not reach the agent to create a channel", name },
				error instanceof Error ? error.stack : String(error),
			);
			throw new ServiceUnavailableException(t("slack.agentNotAnswering"));
		}

		if (response.status >= SERVER_ERROR_STATUS) {
			this.logger.error({
				message: "The agent failed while creating a channel",
				name,
				status: response.status,
			});
			throw new ServiceUnavailableException(t("slack.agentFailed"));
		}

		const reply = slackCreateChannelReply.safeParse(
			await response.json().catch(() => null),
		);

		if (!reply.success) {
			this.logger.error({
				message: "The agent returned an unreadable channel reply",
				name,
				status: response.status,
			});
			throw new ServiceUnavailableException(t("slack.agentUnreadableReply"));
		}

		if ("error" in reply.data) {
			throw new BadRequestException(reply.data.error);
		}

		if (!response.ok) {
			throw new BadRequestException(t("slack.channelCreationRefused"));
		}

		return { channel: reply.data.channel };
	}
}
