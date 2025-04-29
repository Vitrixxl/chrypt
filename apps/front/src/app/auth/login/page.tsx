import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInit } from "@/hooks/use-init";
import { authClient } from "@/lib/auth";
import { $user } from "@/stores/user";
import { useSetAtom } from "jotai";
import { LucideCheck } from "lucide-react";
import { useForm } from "react-hook-form";

const config = {
	title: "Login buddy",
	description: "A simple webapp to securly chat with anyone",
};
export default function LoginPage() {
	const init = useInit();
	const {
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<{ email: string; password: string }>();
	const onSubmit = async (data: { email: string; password: string }) => {
		const { data: signInData, error } = await authClient.signIn.email(data);
		if (error) {
			console.error(error);
			setError("root", { message: error.message });
			return;
		}
		init({ ...signInData.user, publicKey: null, image: null }, data.password);
	};
	return (
		<div className="w-full h-svh grid place-content-center">
			<Card className="w-96">
				<CardHeader>
					<CardTitle> {config.title}</CardTitle>
					<CardDescription>{config.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="flex flex-col gap-2"
						onSubmit={handleSubmit(onSubmit)}
					>
						<Input
							placeholder="Email"
							type="email"
							{...register("email", {
								required: {
									value: true,
									message: "Please enter your email",
								},
							})}
						/>
						<div className="flex gap-2">
							<Input
								placeholder="Password"
								type="password"
								{...register("password")}
							/>
							<Button size="icon">
								<LucideCheck />
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
