"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	PopoverTrigger,
	PopoverContent,
	Popover,
} from "@/components/ui/popover";
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import ChooseUserModal from "./chooseUserModal";
import { io } from "socket.io-client";
import {
	initiateSocket,
	subscribeToChat,
	sendMessage,
	sendTyping,
} from "@/lib/socket";

interface ChatProps {
	className?: string;
}

export function Chat() {
	const [message, setMessage] = useState<string>("");
	const [isOnline, setIsOnline] = useState<boolean>(false);

	const [messages, setMessages] = useState<
		{ isUser: boolean; message: string; date: string }[]
	>([]);
	const [user, setUser] = useState<string | null>(null);
	const [recipient, setRecipient] = useState<string | null>(null);
	const [showModal, setShowModal] = useState(true);
	const [chatId, setChatId] = useState<string | null>(null);
	const [isTyping, setIsTyping] = useState<boolean>(false);

	const handleSubmit = () => {
		sendMessage(chatId, user, message);
		setMessages((prevMessages) => [
			...prevMessages,
			{
				isUser: true,
				message,
				date: new Date().toISOString(),
			},
		]);
		setMessage("");
	};

	const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === "Enter" && !event.shiftKey && message.trim() !== "") {
			handleSubmit();
		}
	};

	useEffect(() => {
		const fetchChatId = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/chats`
				);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				const data = await response.json();
				const chat = data.find((chat: any) =>
					chat.participants.includes(user)
				);
				setChatId(chat._id);
				setMessages(
					chat.messages.map((msg: any) => ({
						isUser: msg.sender === user,
						message: msg.message,
						date: msg.date,
					}))
				);
			} catch (error) {
				console.error("Error fetching chatId:", error);
				// Handle the error appropriately (e.g., show a user-friendly message)
			}
		};

		if (user) {
			// Fetch only if user is logged in
			fetchChatId();
		}
	}, [user]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			setIsTyping(false);
		}, 3000);

		return () => clearTimeout(timeout);
	}, [isTyping]);

	const handleTyping = () => {
		if (!isTyping) {
			setIsTyping(true);
		}
	};

	const emitTyping = () => {
		sendTyping(chatId, user);
	};

	useEffect(() => {
		if (!user || !chatId) return;
		initiateSocket(user, chatId);
		subscribeToChat(
			(error, msgObj) => {
				if (error) {
					console.error(error);
				} else {
					console.log(msgObj.message);
					setMessages((prevMessages) => [
						...prevMessages,
						{
							isUser: false,
							message: msgObj.message,
							date: msgObj.date,
						},
					]);
				}
			},
			() => setIsOnline(false),
			() => setIsOnline(true),
			handleTyping
		);
		if (user === "uldana") setRecipient("daulet");
		else setRecipient("uldana");
		// populate chat and subscribe to new messages using socket.io
	}, [user, chatId]);

	if (!chatId && !showModal) {
		return <div>Loading...</div>;
	}

	return (
		<>
			<div className="flex flex-col h-screen">
				<header className="bg-gray-900 text-white py-4 px-6 flex items-center justify-between">
					<div className="flex gap-2 items-center">
						{user ? (
							<>
								<h1 className="text-xl font-bold">
									Chat with {recipient}
								</h1>
								<div className="flex items-center gap-4">
									{isOnline ? (
										<OnlineIcon className="w-6 h-6" />
									) : (
										<OfflineIcon className="w-6 h-6" />
									)}
								</div>
								{/* add typing indicator */}
								{isTyping && (
									<p className="text-sm text-gray-300">
										{recipient} is typing...
									</p>
								)}
							</>
						) : (
							<h1 className="text-xl font-bold">Please log in</h1>
						)}
					</div>
					<div className="relative">
						<Popover>
							<PopoverTrigger asChild>
								<Button
									className="rounded-full"
									size="icon"
									variant="ghost"
								>
									<Avatar className="border w-8 h-8">
										<AvatarImage
											alt="Image"
											src="/placeholder-user.jpg"
										/>
										<AvatarFallback>
											{user?.charAt(0).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<span className="sr-only">Profile</span>
								</Button>
							</PopoverTrigger>
							<PopoverContent className="w-80 bg-white  shadow-lg rounded-lg p-4">
								<div className="flex items-start gap-4">
									{/* <div className="rounded-full bg-blue-500 w-10 h-10 flex items-center justify-center text-white">
										<MessageCircleIcon className="w-5 h-5" />
									</div> */}
									<div>
										<p className="font-medium">
											Logged in as:{" "}
										</p>
										<p className="text-gray-500  text-sm">
											{user}
										</p>
									</div>
								</div>
							</PopoverContent>
						</Popover>
					</div>
				</header>
				<div className="flex-1 overflow-y-auto p-6">
					<div className="space-y-4">
						{messages.map((msg, index) => (
							<div
								key={index}
								className={`flex items-start gap-4 ${
									msg.isUser ? "justify-end" : ""
								}`}
							>
								{msg.isUser ? (
									<div className="bg-blue-500 text-white rounded-lg p-4 max-w-[80%]">
										<p>{msg.message}</p>
										<p className="text-xs text-gray-200 mt-1">
											{new Date(
												msg.date
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								) : (
									<div className="bg-gray-100  rounded-lg p-4 max-w-[80%]">
										<p>{msg.message}</p>
										<p className="text-xs text-gray-500  mt-1">
											{new Date(
												msg.date
											).toLocaleTimeString([], {
												hour: "2-digit",
												minute: "2-digit",
											})}
										</p>
									</div>
								)}
							</div>
						))}
						{/* <div className="flex items-start gap-4">
							<Avatar className="border w-8 h-8">
								<AvatarImage
									alt="Image"
									src="/placeholder-user.jpg"
								/>
								<AvatarFallback>JD</AvatarFallback>
							</Avatar>
							<div className="bg-gray-100  rounded-lg p-4 max-w-[80%]">
								<p>Hey, how's it going?</p>
								<p className="text-xs text-gray-500  mt-1">
									10:30 AM
								</p>
							</div>
						</div>
						<div className="flex items-start gap-4 justify-end">
							<div className="bg-blue-500 text-white rounded-lg p-4 max-w-[80%]">
								<p>
									Pretty good, just working on a new project.
								</p>
								<p className="text-xs text-gray-200 mt-1">
									10:31 AM
								</p>
							</div>
							<Avatar className="border w-8 h-8">
								<AvatarImage
									alt="Image"
									src="/placeholder-user.jpg"
								/>
								<AvatarFallback>YO</AvatarFallback>
							</Avatar>
						</div>
						<div className="flex items-start gap-4">
							<Avatar className="border w-8 h-8">
								<AvatarImage
									alt="Image"
									src="/placeholder-user.jpg"
								/>
								<AvatarFallback>JD</AvatarFallback>
							</Avatar>
							<div className="bg-gray-100  rounded-lg p-4 max-w-[80%]">
								<p>
									That's great, let me know if you need any
									help!
								</p>
								<p className="text-xs text-gray-500  mt-1">
									10:32 AM
								</p>
							</div>
						</div> */}
					</div>
				</div>
				<div className="bg-gray-100  p-4 flex items-center">
					<Input
						className="flex-1 mr-4"
						placeholder="Type your message..."
						type="text"
						value={message}
						onChange={(e) => {
							setMessage(e.target.value);
							emitTyping();
						}}
						onKeyDown={handleKeyPress}
					/>
					<Button onClick={handleSubmit}>Send</Button>
				</div>
			</div>
			<ChooseUserModal
				showModal={showModal}
				setShowModal={setShowModal}
				setUser={setUser}
			/>
		</>
	);
}

function BellIcon(props: ChatProps) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
			<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
		</svg>
	);
}

function MessageCircleIcon(props: ChatProps) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
		</svg>
	);
}

function OfflineIcon(props: ChatProps) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="grey"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			className="size-6"
		>
			<circle cx="12" cy="12" r="11" />
		</svg>
	);
}

function OnlineIcon(props: ChatProps) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			fill="green"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			className="size-6"
		>
			<circle cx="12" cy="12" r="11" />
		</svg>
	);
}
