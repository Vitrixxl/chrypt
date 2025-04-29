import { LucideLoaderCircle } from "lucide-react";

export function MainLoader() {
	return (
		<div className="h-svh w-full grid place-content-center ">
			<LucideLoaderCircle className="size-20 animate-spin" />
		</div>
	);
}
