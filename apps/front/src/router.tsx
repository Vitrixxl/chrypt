import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthPage from "./app/page";
import ChatLayout from "./app/chats/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CurrentChatPage from "./app/chats/[chatId]/page";
import ActivateLayout from "./app/activate/layout";
import ActivateAccountPage from "./app/activate/account/page";
import ActivateSessionPage from "./app/activate/session/page";
import { useGetKeys } from "./hooks/use-get-keys";
import LoginPage from "./app/auth/login/page";
import RegisterPage from "./app/auth/register/page";
import AuthLayout from "./app/auth/layout";

export function Router() {
	const client = new QueryClient();

	return (
		<QueryClientProvider client={client}>
			<BrowserRouter>
				<Routes>
					<Route index element={<AuthPage />} />
					<Route path="/chats" element={<ChatLayout />}>
						<Route path=":chatId" element={<CurrentChatPage />} />
					</Route>

					<Route path="activate" element={<ActivateLayout />}>
						<Route path="account" element={<ActivateAccountPage />} />
						<Route path="session" element={<ActivateSessionPage />} />
					</Route>
					<Route path="/auth" element={<AuthLayout />}>
						<Route path="login" element={<LoginPage />} />
						<Route path="register" element={<RegisterPage />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</QueryClientProvider>
	);
}
