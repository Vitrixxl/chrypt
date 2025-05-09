import { MultipleAvatar } from "@/components/ui/multiple-avatar";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { PopulatedChat, User } from "@shrymp/types";
import { Link, useParams } from "react-router-dom";

type ChatButtonProps = {
	chat: PopulatedChat;
	user: User;
};
export const ChatButton = ({ chat, user }: ChatButtonProps) => {
	const filtredUsers = chat.users.filter((u) => u.id != user.id);
	const { chatId } = useParams();
	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<SidebarMenuButton
					size="lg"
					asChild
					className={chatId == chat.id ? "bg-accent" : ""}
				>
					<Link to={`/chats/${chat.id}`}>
						<MultipleAvatar users={filtredUsers} />
						<span>
							{filtredUsers
								.slice(0, 3)
								.reverse()
								.map((u) => u.name)
								.join(", ")}
						</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
};
