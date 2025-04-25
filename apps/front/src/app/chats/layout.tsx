import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { authClient } from "@/lib/auth";
import { LucideLoaderCircle } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { AppSidebar } from "./_components/app-sidebar";
import { AppInput } from "./_components/app-input";

export default function ChatLayout() {
	const { data, isPending } = authClient.useSession();

	const navigate = useNavigate();
	if (isPending) {
		return (
			<div className="h-svh w-full flex items-center justify-center">
				<LucideLoaderCircle className="animate-spin size-20" />
			</div>
		);
	}
	if (!data) {
		navigate("/");
		return;
	}
	return (
		<SidebarProvider>
			<AppSidebar user={data.user} />
			<SidebarInset>
				<main className="p-4 flex flex-col h-full relative">
					<SidebarTrigger className="absolute top-4 left-4" />
					<Outlet />
					<AppInput />
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
