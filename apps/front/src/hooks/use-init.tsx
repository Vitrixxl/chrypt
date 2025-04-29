import { User } from "@shrymp/types";
import { useCreateKeys } from "./use-create-keys";
import { useSetAtom } from "jotai";
import { $user } from "@/stores/user";
import { useGetKeys } from "./use-get-keys";
import { $isSessionActive, $privateKeys } from "@/stores/keys-store";
import { useDecodeUserKeys } from "./use-decode-user-keys";
import { useNavigate } from "react-router-dom";

export function useInit() {
	const createKeys = useCreateKeys();
	const getUserKeys = useGetKeys();
	const decodeKeys = useDecodeUserKeys();

	const setUser = useSetAtom($user);
	const setPrivateKeys = useSetAtom($privateKeys);
	const setIsSessionActive = useSetAtom($isSessionActive);

	const navigate = useNavigate();

	return async (user: User, password: string) => {
		// If the user isn't init (first login)
		// We simply generate the keys and then set them to the in memory storage
		// TODO : Add a indexDB storage for the decryptedKeys
		if (!user.publicKey) {
			let { publicKey, privateKey } = await createKeys(password);
			setPrivateKeys([{ ...privateKey, version: 1 }]);
			setUser({ ...user, publicKey });
			setIsSessionActive(true);
			navigate("/chats");
			return;
		}

		// Now if the user is already init we first get the keys
		const { data, error } = await getUserKeys();
		if (error) throw new Error(error.message);

		// Then we decrypt all the keys and store them into the in memory storage
		const keys = await decodeKeys(
			data.map((k) => ({ ...k, decryptedKey: null })),
			password,
		);
		setPrivateKeys(keys);
		setIsSessionActive(true);
		navigate("/chats");
	};
}
