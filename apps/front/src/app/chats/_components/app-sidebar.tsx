import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { UserAvatar } from "@/components/user-avatar";
import { useChats } from "@/hooks/use-chats";
import { LucideShrimp } from "lucide-react";
import { Link } from "react-router-dom";
import { StartChatDialog } from "./start-chat-dialog";
import { User } from "@shrymp/types";
import { ChatButton } from "./chat-button";

type AppSidebarProps = {
	user: User;
};

export function AppSidebar({ user }: AppSidebarProps) {
	const { data, error } = useChats();

	return (
		<Sidebar variant="inset">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link to="/chats">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<LucideShrimp className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">Chrypt</span>
									<span className="truncate text-xs text-muted-foreground">
										Encrypted chat-app
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent className="flex-1 grid grid-rows-[minmax(0,1fr)_auto]">
				<SidebarGroup className="h-full overflow-auto grid-rows-[auto_minmax(0,1fr)]">
					<SidebarGroupLabel>Chats</SidebarGroupLabel>
					{error && error.message}
					<div className="overflow-auto">
						{data &&
							data
								.filter((c) => !c.users.find((u) => u.id == null))
								.map(
									(c) =>
										c.users[0] && (
											<ChatButton chat={c} key={c.id} user={user} />
										),
								)}
					</div>
				</SidebarGroup>
				<SidebarGroup className="mt-auto">
					<SidebarMenu className="">
						<SidebarMenuItem>
							<StartChatDialog />
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							size="lg"
							className="border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex gap-2 items-center">
								<UserAvatar user={user} />
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">{user.name}</span>
									<span className="truncate text-xs text-muted-foreground">
										{user.email}
									</span>
								</div>
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
