import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar className="fixed top-0 left-0 right-0 z-50" />
      <main className="container mx-auto p-4 mt-16 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
