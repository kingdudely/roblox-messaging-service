import EventEmitter from "eventemitter3";
import { z } from "zod";
import {
	HubConnectionBuilder,
	HubConnectionState,
	HttpTransportType,
	LogLevel,
} from "@microsoft/signalr";

const MessageSchema = z.object({
	Sent: z.number().finite(),
	Data: z.json(),
});

export default class MessagingService {
	#Connection;
	#Events = new EventEmitter();

	constructor(ROBLOSECURITY, universeId) {
		this.#Connection = new HubConnectionBuilder()
			.withUrl(
				`https://csm.roblox.com/v1/router/?id=&universeId=${universeId}`,
				{
					transport: HttpTransportType.WebSockets,
					skipNegotiation: true,
					headers: {
						"X-Roblox-ChannelType": "Test",
						"Cookie": `.ROBLOSECURITY=${ROBLOSECURITY}`,
					},
				},
			)
			.withAutomaticReconnect()
			.configureLogging(LogLevel.Warning)
			.build();

		this.#Connection.on("Message", (topic, payload) => {
			const message = MessageSchema.parse(JSON.parse(payload));

			this.#Events.emit(topic, {
				message,
				data: message.Data,
			});
		});

		this.#Connection.onreconnected(async () => {
			for (const topic of this.#Events.eventNames()) {
				await this.#Connection.invoke("Subscribe", topic, 0);
            }
		});

		this.#Connection.onclose(() => {
			this.#Events.removeAllListeners();
		});
	}

	get Closed() {
		return this.#Connection.state === HubConnectionState.Disconnected;
	}

	async ConnectAsync() {
		await this.#Connection.start();
	}

	async PublishAsync(topic, data) {
		const message = MessageSchema.parse({
			Data: data,
			Sent: Date.now() / 1_000,
		});

		await this.#Connection.invoke(
			"Publish",
			topic,
			JSON.stringify(message),
			0,
		);
	}

	async SubscribeAsync(topic, callback) {
		if (this.#Events.listenerCount(topic) === 0) {
			await this.#Connection.invoke("Subscribe", topic, 0);
        }

		this.#Events.on(topic, callback);
	}

	async UnsubscribeAsync(topic, callback) {
		this.#Events.off(topic, callback);

		if (this.#Events.listenerCount(topic) === 0) {
			await this.#Connection.invoke("Unsubscribe", topic);
        }
	}

	async DisconnectAsync() {
		await this.#Connection.stop();
	}
}