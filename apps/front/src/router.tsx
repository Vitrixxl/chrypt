import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./app/page";
import ChatLayout from "./app/chats/layout";

export function Router() {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<AuthPage />} />
				<Route path="/chats" element={<ChatLayout />}></Route>
			</Routes>
		</BrowserRouter>
	);
}
