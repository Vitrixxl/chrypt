import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/use-chats";
import { LucideEllipsisVertical, LucideLoaderCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function CurrentChatPage() {
	const { chatId } = useParams();
	const navigate = useNavigate();
	if (!chatId) {
		navigate("/chats");
		return;
	}
	const { data, isLoading } = useChats();

	if (isLoading) {
		return (
			<div className="size-full flex items-center justify-center">
				<LucideLoaderCircle className="animate-spin size-20" />
			</div>
		);
	}
	if (!data) {
		navigate("/chats");
		return;
	}

	const currentChat = data.find((d) => d.id == chatId);
	if (!currentChat) {
		navigate("/chats");
		return;
	}

	return (
		<div className="flex flex-col h-full py-0.5">
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
		</div>
	);
}
