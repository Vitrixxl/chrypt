import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import React from "react";
import { LucideLoader, LucideLoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const config = {
	title: "Welcome to chrypt",
	description: "A end to end encrypted chat app probably open source",
	loginLabel: "Login with Google",
	loadingLabel: "Loading",
};

export default function AuthPage() {
	const [isLoading, setIsLoading] = React.useState(false);
	const { isPending, data } = authClient.useSession();
	const navigate = useNavigate();
	const signIn = async () => {
		setIsLoading(true);
		const { data, error } = await authClient.signIn.social({
			callbackURL: "http://localhost:5173/chats",
			provider: "google",
		});
		console.log(data, error);
		setIsLoading(false);
	};

	if (isPending) {
		return (
			<div className="h-svh w-full flex items-center justify-center">
				<LucideLoaderCircle className="animate-spin size-20" />
			</div>
		);
	}

	if (data) {
		navigate("/chats");
	}

	return (
		<>
			<div className="min-h-screen flex items-center justify-center">
				<Card className="w-96">
					<CardHeader>
						<CardTitle>{config.title}</CardTitle>
						<CardDescription>{config.description}</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-2">
						<Input />
						<Input />
						{/* <Button className="w-full" onClick={signIn}> */}
						{/* 	{isLoading ? ( */}
						{/* 		<> */}
						{/* 			<LucideLoader className="animate-spin" /> */}
						{/* 			{config.loadingLabel} */}
						{/* 		</> */}
						{/* 	) : ( */}
						{/* 		<> */}
						{/* 			<FcGoogle /> */}
						{/* 			{config.loginLabel} */}
						{/* 		</> */}
						{/* 	)} */}
						{/* </Button> */}
					</CardContent>
				</Card>
			</div>
		</>
	);
}
