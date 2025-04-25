import React from "react";

type UseAutoFocusParams = {
	ref: React.RefObject<HTMLElement | null>;
	listen: boolean;
};

export function useAutoFocus({ ref, listen }: UseAutoFocusParams) {
	const isInputOrTextareaFocused = () => {
		const active = document.activeElement;
		return (
			active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
		);
	};

	const handleKeyDown = () => {
		!isInputOrTextareaFocused() && ref.current && ref.current.focus();
	};

	React.useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [listen, ref]);
}
