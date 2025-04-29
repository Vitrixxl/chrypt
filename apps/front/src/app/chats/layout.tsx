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
import { useAtomValue } from "jotai";
import { $isSessionActive, $privateKeys } from "@/stores/keys-store";

export default function ChatLayout() {
	const { data, isPending } = authClient.useSession();
	const isSessionActive = useAtomValue($isSessionActive);
	const privateKeys = useAtomValue($privateKeys);
	console.log(privateKeys);

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
	if (!data.user.publicKey) {
		navigate("/activate/account");
		return;
	}
	if (!isSessionActive) {
		navigate("/activate/session");
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
