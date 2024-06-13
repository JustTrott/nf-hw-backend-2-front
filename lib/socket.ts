import io, { Socket } from "socket.io-client";

let socket: Socket;

export const initiateSocket = (username: string, chatId: string) => {
	socket = io(
		process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:5000",
		{
			transports: ["websocket"],
		}
	);
	console.log(`Connecting socket room ${username} ...`);
	if (socket && username) socket.emit("JOIN_CHAT", { chatId, username });
};

export const disconnectSocket = () => {
	console.log("Disconnecting socket...");
	if (socket) socket.disconnect();
};

export const subscribeToChat = (
	cb: (
		error: Error | null,
		msgObj: { message: string; date: string }
	) => void,
	onOffline: () => void,
	onOnline: () => void,
	onTyping: () => void
) => {
	if (!socket) return true;
	socket.on("MESSAGE", (msgObj) => {
		console.log("Websocket event received!");
		return cb(null, msgObj);
	});
	socket.on("RECIPIENT_OFFLINE", () => {
		console.log("Recipient is offline");
		return onOffline();
	});
	socket.on("RECIPIENT_ONLINE", () => {
		console.log("Recipient is online");
		return onOnline();
	});
	socket.on("TYPING", () => {
		console.log("Recipient is typing");
		return onTyping();
	});
};

export const unsubscribeFromChat = () => {
	socket.off("MESSAGE");
};

export const sendMessage = (
	chatId: string | null,
	sender: string | null,
	message: string
) => {
	if (!sender || !chatId) return;
	if (socket) socket.emit("SEND_MESSAGE", { chatId, sender, message });
};

export const sendTyping = (chatId: string | null, sender: string | null) => {
	if (!sender || !chatId) return;
	if (socket) socket.emit("TYPING", { chatId, sender });
};
