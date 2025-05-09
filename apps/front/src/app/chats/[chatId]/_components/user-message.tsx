import { UserAvatar } from "@/components/user-avatar";
import { DecryptedMessage, User } from "@shrymp/types";

type UserMessageProps = {
	user: User;
	message: DecryptedMessage;
};
export function UserMessage({ user, message }: UserMessageProps) {
	return (
		<div className="ml-auto grid grid-cols-[minmax(0,1fr)_auto] gap-2 max-w-[500px] justify-end">
			<div className="bg-primary text-primary-foreground rounded-lg px-3 py-2 break-words break-all overflow-hidden w-fit max-w-full">
				<span className="">{message.content}</span>
			</div>
			<div className="mt-1">
				<UserAvatar user={user} />
			</div>
		</div>
	);
}
