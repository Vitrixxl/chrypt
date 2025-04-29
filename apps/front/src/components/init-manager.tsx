import { authClient } from "@/lib/auth";
import { MainLoader } from "./main-loader";
import { useNavigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { $isSessionActive } from "@/stores/keys-store";

export function InitManager({ children }: React.PropsWithChildren) {
	const navigate = useNavigate();
	const { data, isPending } = authClient.useSession();
	const isSessionActive = useAtomValue($isSessionActive);
	if (!data && isPending) {
		return <MainLoader />;
	}

	if (!data) {
		navigate("/");
	}

	if (data && !data.user.publicKey) {
		navigate("/activate/account");
	}

	if (!isSessionActive) {
		navigate("/activate/session");
	}

	return children;
}
