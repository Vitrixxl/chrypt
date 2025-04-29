import React from "react";

export function useDebounceState<T>(initialValue: T, timeout: number) {
	const [actualState, setActualState] = React.useState<T>(initialValue);
	const [state, setState] = React.useState<T>(initialValue);
	const timeoutRef = React.useRef<number | null>(null);

	React.useEffect(() => {
		if (timeoutRef.current != null) {
			clearTimeout(timeoutRef.current);
		}
		timeoutRef.current = window.setTimeout(() => {
			setActualState(state);
		}, timeout);

		return () => {
			if (timeoutRef.current != null) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [state]);

	return [actualState, state, setState] as const;
}
