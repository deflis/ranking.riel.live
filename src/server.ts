import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

import { applySsrCachePolicy } from "./modules/utils/ssrCache";

export default createServerEntry({
	async fetch(request, options) {
		const response = await handler.fetch(request, options);
		return applySsrCachePolicy(request, response);
	},
});
