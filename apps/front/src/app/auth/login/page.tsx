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
import { afterAuthHandler } from "@/services/init-service";
import { initKeys } from "@/services/key-service";
import { tryCatch } from "@shrymp/utils";
import { LucideCheck, LucideLoaderCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const config = {
	title: "Login buddy",
	description: "A simple webapp to securly chat with anyone",
};
export default function LoginPage() {
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		formState: { isLoading, errors },
		setError,
	} = useForm<{ email: string; password: string }>();
	const onSubmit = async (data: { email: string; password: string }) => {
		const { error } = await authClient.signIn.email(data);
		if (error) {
			console.error(error);
			setError("root", { message: error.message });
			return;
		}
		const { error: initError } = await tryCatch(
			afterAuthHandler(data.password),
		);
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
							placeholder="Email"
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
								{isLoading ? (
									<LucideLoaderCircle className="animate-spin" />
								) : (
									<LucideCheck />
								)}
							</Button>
						</div>
					</form>
					{errors.root && (
						<p className="text-destructive text-sm">{errors.root.message}</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
