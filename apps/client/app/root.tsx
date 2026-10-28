import {
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	isRouteErrorResponse,
	Link,
} from "react-router";
import type { Route } from "./+types/root";
import "./app.css";

export const links: Route.LinksFunction = () => [
	{
		rel: "preload",
		href: "/assets/fonts/urbanist-latin.woff2",
		as: "font",
		type: "font/woff2",
		crossOrigin: "anonymous",
	},
	{ rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
];
export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<Meta />
				<Links />
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}
export default function App() {
	return <Outlet />;
}
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	const missing = isRouteErrorResponse(error) && error.status === 404;
	return (
		<main className="error-page">
			<p className="eyebrow">Einao Solutions</p>
			<h1>
				{missing ? "We couldn’t find that page." : "Something went wrong."}
			</h1>
			<p>
				{missing
					? "Explore our capabilities or return to the homepage."
					: "Please try again in a moment."}
			</p>
			<Link className="arrow-button" to="/">
				Back to Home<span aria-hidden="true">↗</span>
			</Link>
		</main>
	);
}
