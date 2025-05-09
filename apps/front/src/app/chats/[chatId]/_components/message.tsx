import { UserAvatar } from "@/components/user-avatar";
import { $currentChatUsers } from "@/stores/keys-store";
import { DecryptedMessage } from "@shrymp/types";
import { useAtomValue } from "jotai";

type MessageProps = {
	message: DecryptedMessage;
};
export function Message({ message }: MessageProps) {
	const currentChatUsers = useAtomValue($currentChatUsers);

	if (!currentChatUsers || !currentChatUsers[message.userId]) return null;

	return (
		<div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 max-w-[500px]">
			<div className="mt-1">
				<UserAvatar user={currentChatUsers[message.userId]} />
			</div>
			<div className="border rounded-lg break-all break-words p-2 px-3 overflow-hidden w-fit max-w-full">
				<span>{message.content}</span>
			</div>
		</div>
	);
}
