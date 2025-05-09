import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth";
import { initKeys } from "@/services/key-service";
import { tryCatch } from "@shrymp/utils";
import { LucideCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const config = {
	title: "Register buddy",
	description: "A simple webapp to securly chat with anyone",
};

type RegisterData = {
	name: string;
	email: string;
	password: string;
};

export default function RegisterPage() {
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		setError,
		formState: { isLoading, errors },
	} = useForm<RegisterData>();

	const onSubmit = async (data: RegisterData) => {
		const { error } = await authClient.signUp.email(data);
		if (error) {
			setError("root", { message: error.message });
			return;
		}
		const { error: initError } = await tryCatch(initKeys(data.password));
		if (initError) {
			setError("root", { message: initError.message });
			return;
		}
		navigate("/chats");
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
							placeholder="Name"
							{...register("name", {
								required: {
									value: true,
									message: "Please enter your name",
								},
							})}
						/>
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
					{errors.root && (
						<p className="text-xs text-destructive">{errors.root.message}</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
