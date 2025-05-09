import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAutoFocus } from "@/hooks/use-autofocus";
import { LucideCheck } from "lucide-react";
import React from "react";
import { safeFetch } from "@/lib/utils";
import { authClient } from "@/lib/auth";
import { generateRSAKeys } from "@/services/encryption-service";

export default function ActivateAccountPage() {
	const [assphrase, setPassphrase] = React.useState("");
	const { data } = authClient.useSession();
	console.log(data);

	const inputRef = React.useRef<HTMLInputElement | null>(null);
	useAutoFocus({ ref: inputRef, listen: true });

	const {
		handleSubmit,
		register,
		setError,
		formState: { errors },
	} = useForm<{
		passphrase: string;
		confirm: string;
	}>();

	const onSubmit = async (data: { passphrase: string; confirm: string }) => {
		if (data.passphrase != data.confirm) {
			setError("confirm", { message: "Passphrases do not match" });
			return;
		}
		const { publicKey, privateKey } = await generateRSAKeys(data.passphrase);
		const { data: result, error } = await safeFetch<{ message: string }>(
			"/user/keys",
			{
				method: "POST",
				body: {
					publicKey,
					privateKey: {
						iv: privateKey.iv,
						salt: privateKey.salt,
						key: privateKey.key,
						version: 1,
					},
				},
			},
		);
		console.log(result, error);
	};

	return (
		<div className="h-svh w-full flex items-center justify-center ">
			<Card className="w-96">
				<CardHeader>
					<CardTitle>Enter a passphrase</CardTitle>
					<CardDescription>
						This passphrase will be use to encrypt your data so make sure to
						remember it.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="flex-col flex gap-2"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="flex flex-col gap-1">
							<Input
								{...register("passphrase", {
									required: {
										value: true,
										message: "The passphrase is required",
									},
									minLength: {
										value: 12,
										message:
											"The passphrase must contain at least 12 caracters",
									},
									maxLength: {
										value: 32,
										message:
											"The passphrase must contain less than 32 caracters",
									},
									pattern: {
										value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).*$/,
										message:
											"The password must contain at least 1 lowercase letter, 1 uppercase letter, 1 digit, and 1 special character.",
									},
								})}
								type="password"
								placeholder="Enter your passphrase..."
							/>
							{errors.passphrase && (
								<p className="text-xs text-destructive">
									{errors.passphrase.message}
								</p>
							)}
						</div>

						<div className="flex flex-col gap-1">
							<div className="flex gap-2">
								<Input
									{...register("confirm", {
										required: {
											value: true,
											message: "The passphrase is required",
										},
										min: {
											value: 12,
											message:
												"The passphrase must contain at least 12 caracters",
										},
										max: {
											value: 32,
											message:
												"The passphrase must contain less than 32 caracters",
										},
									})}
									type="password"
									placeholder="Confirm your passphrase..."
								/>
								<Button size="icon">
									<LucideCheck />
								</Button>
							</div>
							{errors.confirm && (
								<p className="text-xs text-destructive">
									{errors.confirm.message}
								</p>
							)}
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
