import { useAtomValue } from "jotai";
import { useEffect } from "react";

import { adModeAtom } from "../../../modules/atoms/global";

declare global {
	interface Window {
		adsbygoogle: Array<unknown>;
	}
}

interface AdsenseProps {
	slot?: string;
	format?: string;
	responsive?: string;
	className?: string;
}

export const adSenseClientId = "ca-pub-6809573064811153";

export const AdSense: React.FC<AdsenseProps> = ({
	slot = "3138091970",
	format = "auto",
	responsive = "true",
	className,
}) => {
	const adMode = useAtomValue(adModeAtom);
	return adMode ? (
		<InnerAdSense
			slot={slot}
			format={format}
			responsive={responsive}
			className={className}
		/>
	) : null;
};

const InnerAdSense: React.FC<AdsenseProps> = ({
	slot,
	format,
	responsive,
	className,
}) => {
	useEffect(() => {
		if (!window) return;
		try {
			window.adsbygoogle = window.adsbygoogle || [];
			window.adsbygoogle.push({});
		} catch (e) {
			console.error(e);
		}
	}, []);

	return (
		<div className={className}>
			<ins
				className="adsbygoogle"
				style={{ display: "block" }}
				data-ad-client={adSenseClientId}
				data-ad-slot={slot}
				data-ad-format={format}
				data-full-width-responsive={responsive}
			/>
		</div>
	);
};

export default AdSense;
