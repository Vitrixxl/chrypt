import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { $isSessionActive } from "@/stores/keys-store";
import { tryCatch } from "@shrymp/utils";
import { useSetAtom } from "jotai";
import { LucideCheck, LucideLoaderCircle } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDecodeUserKeys } from "@/hooks/use-decode-user-keys";
import { useGetKeys } from "@/hooks/use-get-keys";
import { MainLoader } from "@/components/main-loader";

export default function ActivateSessionPage() {
	const navigate = useNavigate();
	const decodeKeys = useDecodeUserKeys();
	const { privateKeys } = useGetKeys();

	const [error, setError] = React.useState<string>();
	const [isLoading, setIsLoading] = React.useState(false);
	const [passphrase, setPassphrase] = React.useState("");

	const setIsSessionActive = useSetAtom($isSessionActive);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!privateKeys) return;

		setIsLoading(true);
		const { data, error } = await tryCatch(decodeKeys(privateKeys, passphrase));
		console.log(data, error);
		if (error) {
			console.error(error);
			setError("Invalid passphrase");
			setIsLoading(false);
			return;
		}
		setIsLoading(false);
		setIsSessionActive(true);

		navigate("/chats");
	};

	if (!privateKeys) {
		return <MainLoader />;
	}
	return (
		<div className="h-svh w-full grid place-content-center ">
			<Card className="w-96">
				<CardHeader>
					<CardTitle>Enter your passphrase</CardTitle>
					<CardDescription>
						This passphrase will be use to encrypt your data so make sure to
						remember it.
					</CardDescription>
				</CardHeader>
				<CardContent className="">
					<form className="flex gap-2" onSubmit={handleSubmit}>
						<Input
							placeholder="Enter your passphrase..."
							type="password"
							value={passphrase}
							onChange={(e) => setPassphrase(e.currentTarget.value)}
						/>
						<Button size="icon">
							{!isLoading ? (
								<LucideCheck />
							) : (
								<LucideLoaderCircle className="animate-spin " />
							)}
						</Button>
					</form>
					{error && <p className="text-destructive text-xs mt-1">{error}</p>}
				</CardContent>
			</Card>
		</div>
	);
}
