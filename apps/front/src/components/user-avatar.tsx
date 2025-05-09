import { type User } from "@shrymp/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
type UserAvatarProps = {
	user: User;
};

export function UserAvatar({ user }: UserAvatarProps) {
	return (
		<Avatar className="rounded-full border">
			{user.image && <AvatarImage src={user.image} />}
			<AvatarFallback className="rounded-full select-none">
				{user.name.slice(0, 2).toUpperCase()}
			</AvatarFallback>
		</Avatar>
	);
}
