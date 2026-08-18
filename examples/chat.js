import MessagingService from "roblox-messaging-service";

const universeId = 69_420_1337_80085;
const ROBLOSECURITY = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|...";

const messagingService = new MessagingService(ROBLOSECURITY, universeId);
await messagingService.ConnectAsync();

await messagingService.SubscribeAsync("chat", async function onChat(message) {
        console.log("Received message:", message.Data);
        console.log("When it was sent:", message.Sent);
        await messagingService.UnsubscribeAsync("chat", onChat);
        await messagingService.DisconnectAsync();
});

await messagingService.PublishAsync("chat", "Yo, wassup bro?!");
