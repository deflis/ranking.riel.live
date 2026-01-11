import type { PropsWithChildren } from "react";

const DetailItemText: React.FC<
	PropsWithChildren<{ label: React.ReactNode; icon?: React.ReactNode }>
> = ({ label, icon, children }) => {
	return (
		<div className="flex">
			<div className="basis-0 grow shrink-0 text-right font-bold align-middle">
				{label}
			</div>
			<div className="w-6 pr-0.5 text-right align-middle text-neutral-400">
				{icon}
			</div>
			<div className="basis-0 grow-3 shrink">{children}</div>
		</div>
	);
};
export default DetailItemText;
