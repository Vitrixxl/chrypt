import { User } from "@shrymp/types";
import { UserAvatar } from "../user-avatar";

type MultipleAvatarProps = {
	users: User[];
};

export const MultipleAvatar = ({ users }: MultipleAvatarProps) => {
	return (
		<div className="flex flex-row-reverse">
			{users.slice(0, 3).map((u, i) => (
				<div
					className={`${i != users.slice(0, 3).length - 1 ? "-ml-4" : ""}`}
					key={i}
				>
					<UserAvatar user={u} />
				</div>
			))}
		</div>
	);
};
