import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { User } from "better-auth/types";
import { LucideShrimp } from "lucide-react";
import { Link } from "react-router-dom";
import { StartChatDialog } from "./start-chat-dialog";

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
											<SidebarMenu key={c.id}>
												<SidebarMenuItem>
													<SidebarMenuButton size="lg" asChild>
														<Link to={`/chats/${c.id}`}>
															<UserAvatar user={c.users[0]} />
															{c.users[0] && c.users[0].name}
														</Link>
													</SidebarMenuButton>
												</SidebarMenuItem>
											</SidebarMenu>
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
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<div className="flex gap-2 items-center">
								<Avatar className="h-8 w-8 rounded-lg">
									{user.image && <AvatarImage src={user.image} />}
									<AvatarFallback>
										{user.name.toUpperCase().slice(0, 2)}
									</AvatarFallback>
								</Avatar>
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
