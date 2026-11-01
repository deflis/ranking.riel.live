import { Outlet, createFileRoute } from "@tanstack/react-router";

import { R18DialogForm } from "@/components/ui/common/R18Dialog";

export const Route = createFileRoute("/r18")({
	ssr: false,
	component: R18Layout,
});

function R18Layout() {
	return (
		<>
			<R18DialogForm />
			<Outlet />
		</>
	);
}
