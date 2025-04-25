"use client";
import { cn } from "@/lib/utils";
import React, {
	forwardRef,
	useEffect,
	useRef,
	useImperativeHandle,
} from "react";

export const ReziseTextArea = forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ onChange, className, ...props }, forwardedRef) => {
	const internalRef = useRef<HTMLTextAreaElement | null>(null);

	useImperativeHandle(forwardedRef, () => internalRef.current!);

	const resize = () => {
		if (!internalRef.current) return;
		const textarea = internalRef.current;
		textarea.style.height = "0";
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		resize();
		if (onChange) onChange(e);
	};

	useEffect(() => {
		resize();
	}, []);

	return (
		<textarea
			ref={internalRef}
			{...props}
			onChange={handleInput}
			className={cn("outline-none", className)}
			style={{ resize: "none", ...props.style }}
		/>
	);
});

ReziseTextArea.displayName = "ReziseTextArea";
