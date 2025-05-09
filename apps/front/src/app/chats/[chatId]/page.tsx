import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/use-chats";
import { $currentChatKeys, $currentChatUsers } from "@/stores/keys-store";
import { PopulatedChat, PublicKey, User } from "@shrymp/types";
import { useAtomValue, useSetAtom } from "jotai";
import { LucideEllipsisVertical, LucideLoaderCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { MessageList } from "./_components/message-list";
import React from "react";
import { $user } from "@/stores/user";

export default function CurrentChatPage() {
	const { chatId } = useParams();
	const user = useAtomValue($user);
	const navigate = useNavigate();
	const setCurrentChatKeys = useSetAtom($currentChatKeys);
	const setCurrentChatUsers = useSetAtom($currentChatUsers);
	const [isLoading, setIsLoading] = React.useState(true);
	const [currentChat, setCurrentChat] = React.useState<PopulatedChat | null>(
		null,
	);
	if (!chatId) {
		navigate("/chats");
		return;
	}

	const chatQuery = useChats();
	React.useEffect(() => {
		if (!chatId) navigate("/");
		if (!user) navigate("/auth/login");
		if (chatQuery.isLoading) {
			setIsLoading(true);

			return;
		}
		if (!chatQuery.data) {
			navigate("/chats");
			return;
		}

		const currentChat = chatQuery.data.find((c) => c.id == chatId);

		if (!currentChat) {
			navigate("/chats");
			return;
		}
		setCurrentChat(currentChat);

		const activatedUsers: (User & { publicKey: string; keyVersion: number })[] =
			[];

		currentChat.users.forEach((u) => {
			if (u.publicKey && u.keyVersion) {
				activatedUsers.push(
					u as User & { publicKey: string; keyVersion: number },
				);
			}
		});

		activatedUsers.push(
			user as User & { publicKey: string; keyVersion: number },
		);

		setCurrentChatUsers(
			Object.fromEntries(activatedUsers.map((u) => [u.id, u])),
		);

		setCurrentChatKeys(
			Object.fromEntries(
				activatedUsers.map((u) => [
					u.id,
					{
						key: u.publicKey,
						version: u.keyVersion || 1,
					},
				]),
			) as Record<string, PublicKey>,
		);

		setIsLoading(false);
	}, [chatId, chatQuery]);

	if (isLoading || !currentChat) {
		return (
			<div className="size-full flex items-center justify-center">
				<LucideLoaderCircle className="animate-spin size-20" />
			</div>
		);
	}

	return (
		<div className="grid grid-rows-[auto_minmax(0,1fr)] h-full ">
			<header className="pl-12 flex gap-4">
				<div className="w-full flex gap-2">
					<div>{currentChat.users[0].name}</div>
				</div>
				<div>
					<Button size="icon">
						<LucideEllipsisVertical />
					</Button>
				</div>
			</header>
			<MessageList chatId={chatId} />
		</div>
	);
}
