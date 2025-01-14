import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
	return (
		<div className="min-h-screen">
			<Navbar />
			<main className="container mx-auto p-4">
				<Outlet />
			</main>
		</div>
	);
}
