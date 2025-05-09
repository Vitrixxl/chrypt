import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatLayout from "./app/chats/layout";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import CurrentChatPage from "./app/chats/[chatId]/page";
import LoginPage from "./app/auth/login/page";
import RegisterPage from "./app/auth/register/page";
import AuthLayout from "./app/auth/layout";
import { Toaster } from "./components/ui/sonner";
import AppLayout from "./app/layout";

export const queryClient = new QueryClient();
export function Router() {
	return (
		<>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					<Routes>
						<Route path="/" element={<AppLayout />}>
							<Route path="/chats" element={<ChatLayout />}>
								<Route path=":chatId" element={<CurrentChatPage />} />
							</Route>

							<Route path="/auth" element={<AuthLayout />}>
								<Route path="login" element={<LoginPage />} />
								<Route path="register" element={<RegisterPage />} />
							</Route>
						</Route>
					</Routes>
				</BrowserRouter>
			</QueryClientProvider>
			<Toaster />
		</>
	);
}
