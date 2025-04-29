import { Button } from "@/components/ui/button";
import {
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/user-avatar";
import { useAutoFocus } from "@/hooks/use-autofocus";
import { useDebounceState } from "@/hooks/use-debounce-state";
import { useSearchUser } from "@/hooks/use-search-user";
import { User } from "@shrymp/types";
import { tryCatch } from "@shrymp/utils";
import {
	LucideLoaderCircle,
	LucidePlus,
	LucideSquarePen,
	LucideX,
} from "lucide-react";
import React from "react";

export function StartChatDialog() {
	const [search, currentSearch, setSearch] = useDebounceState("", 300);
	const containerRef = React.useRef<HTMLDivElement | null>(null);
	const [selectedUsers, setSelectedUsers] = React.useState<User[]>([]);
	const { data, isLoading } = useSearchUser({ query: search });
	const inputRef = React.useRef<HTMLInputElement | null>(null);
	useAutoFocus({ ref: inputRef, listen: true });
	const handleCreate = async () => {
		const { data, error } = await tryCatch(
			fetch("http://localhost:3000/chats", {
				headers: {
					"Content-Type": "application/json",
				},
				method: "post",
				credentials: "include",
				body: JSON.stringify({ userIds: selectedUsers.map((u) => u.id) }),
			}).then((data) => data.text()),
		);
		console.log({ data, error });
	};

	React.useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		const scrollHeight = container.scrollHeight;
		container.style.maxHeight = `${scrollHeight}px`;
	}, [data]);
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button className="w-full">
					<LucidePlus />
					Start a chat
				</Button>
			</DialogTrigger>

			<DialogContent className="translate-y-0 top-12 flex flex-col">
				<DialogTitle>Search for your friends and start a chat</DialogTitle>
				<DialogDescription>
					You can make a simple chat or a group chat by selecting multiple users
				</DialogDescription>
				<div className="flex flex-col gap-4 w-full">
					<div className="flex gap-2 ">
						<Input
							className="w-full"
							placeholder="John doe..."
							ref={inputRef}
							value={currentSearch}
							onChange={(e) => setSearch(e.currentTarget.value)}
						/>
						{selectedUsers.length > 0 && (
							<Button size="icon" onClick={handleCreate}>
								<LucideSquarePen />
							</Button>
						)}
					</div>

					{selectedUsers.length > 0 && (
						<div className="flex gap-1 overflow-x-auto w-full scrollbar-hidden ">
							{selectedUsers.map((u) => (
								<div
									className="bg-accent  rounded-lg max-w-content flex gap-1 text-sm items-center justify-center px-2 py-1 scrollbar-hidden text-muted-foreground hover:text-foreground transition-colors"
									key={u.id}
								>
									<span className="flex-1 text-nowrap">{u.name}</span>
									<button
										onClick={() =>
											setSelectedUsers((users) =>
												users.filter((user) => user.id != u.id),
											)
										}
									>
										<LucideX className="size-4" />
									</button>
								</div>
							))}
						</div>
					)}

					<div
						className="w-full rounded-lg  flex flex-col gap-2 transition-[max-height] max-h-0 overflow-hidden duration-300"
						ref={containerRef}
					>
						{data
							? data.map((u) => (
									<Button
										key={u.id}
										className="justify-start px-2 py-2 h-auto"
										variant="ghost"
										size="lg"
										onClick={() => {
											!selectedUsers.find((user) => user.id == u.id) &&
												setSelectedUsers((s) => [...s, u]);
										}}
									>
										<UserAvatar user={u} />

										<span>{u.name}</span>
									</Button>
								))
							: search != "" &&
								isLoading && (
									<LucideLoaderCircle className="animate-spin mx-auto text-primary" />
								)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
