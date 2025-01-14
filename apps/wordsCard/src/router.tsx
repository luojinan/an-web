import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import DictionaryConfig from "./pages/DictionaryConfig";
import Home from "./pages/Home";

const router = createBrowserRouter(
	[
		{
			path: "/",
			element: <AppLayout />,
			children: [
				{
					index: true,
					element: <Home />,
				},
				{
					path: "config",
					element: <DictionaryConfig />,
				},
			],
		},
	],
	{
		basename: "/wordsCard", // Set the basename here
	},
);

export default router;
