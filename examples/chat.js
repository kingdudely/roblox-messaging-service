import MessagingServiceFactory from "roblox-messaging-service";

const universeId = 69_420_1337_80085;
const ROBLOSECURITY = "_|WARNING:-DO-NOT-SHARE-THIS.--Sharing-this-will-allow-someone-to-log-in-as-you-and-to-steal-your-ROBUX-and-items.|...";

const MessagingService = new MessagingServiceFactory(ROBLOSECURITY, universeId);
await MessagingService.ConnectAsync();

await MessagingService.SubscribeAsync("chat", async function onChat(message) {
        console.log("Received message:", message.Data);
        console.log("When it was sent:", message.Sent);
        await MessagingService.UnsubscribeAsync("chat", onChat);
        await MessagingService.DisconnectAsync();
});

await MessagingService.PublishAsync("chat", "Yo, wassup bro?!");
