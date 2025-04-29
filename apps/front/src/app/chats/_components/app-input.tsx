import { ReziseTextArea } from "@/components/resize-textarea";
import { Button } from "@/components/ui/button";
import { useAutoFocus } from "@/hooks/use-autofocus";
import { useSendMessage } from "@/hooks/use-send-message";
import { LucideSend } from "lucide-react";
import React from "react";

export function AppInput() {
	const [inputValue, setInputValue] = React.useState("");
	const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
	useAutoFocus({ ref: inputRef, listen: true });

	const sendMessage = useSendMessage();

	const handleChange = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.code == "Enter") {
		}
	};
	return (
		<form className="max-w-[800px] mx-auto w-full mt-auto">
			<div className="flex gap-2 p-2 border rounded-lg  items-end pl-3  w-full h-full">
				<div className="h-full flex items-center w-full">
					<ReziseTextArea
						ref={inputRef}
						value={inputValue}
						onKeyUp={handleChange}
						rows={1}
						className="flex-1 max-h-[25svh] resize-none outline-none"
						placeholder="Type your message"
					/>
				</div>
				<Button size="icon" className="size-8">
					<LucideSend />
				</Button>
			</div>
		</form>
	);
}
