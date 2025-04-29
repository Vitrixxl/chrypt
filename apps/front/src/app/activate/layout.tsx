import { authClient } from "@/lib/auth";
import { $isSessionActive } from "@/stores/keys-store";
import { useAtomValue } from "jotai";
import { LucideLoaderCircle } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

export default function ActivateLayout() {
	const { data, isPending } = authClient.useSession();
	const isSessionActive = useAtomValue($isSessionActive);
	const navigate = useNavigate();
	const { pathname } = useLocation();

	if (isPending) {
		return (
			<div className="h-svh w-full grid place-content-center">
				<LucideLoaderCircle className="size-20 animate-spin" />
			</div>
		);
	}
	if (!data) {
		navigate("/");
		return;
	}
	console.log(location.pathname);
	if (!data.user.publicKey && pathname != "/activate/account") {
		navigate("/activate/account");
		return;
	}
	if (!isSessionActive && pathname != "/activate/session") {
		navigate("/activate/session");
		return;
	}

	return <Outlet />;
}
