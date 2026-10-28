import { createRequestHandler } from "react-router";
declare module "react-router" {
	interface AppLoadContext {
		cloudflare: { env: Env; ctx: ExecutionContext };
	}
}
const handler = createRequestHandler(
	() => import("virtual:react-router/server-build"),
	import.meta.env.MODE,
);
export default {
	async fetch(request, env, ctx) {
		const response = await handler(request, { cloudflare: { env, ctx } });
		response.headers.set("X-Content-Type-Options", "nosniff");
		response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
		if (String(env.SITE_INDEXABLE) !== "true")
			response.headers.set("X-Robots-Tag", "noindex, nofollow");
		return response;
	},
} satisfies ExportedHandler<Env>;
