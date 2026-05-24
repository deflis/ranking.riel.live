import { useAtomValue } from "jotai";
import { useEffect } from "react";

import { clsx } from "clsx";
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
	layoutKey?: string;
	className?: string;
}

export const adSenseClientId = "ca-pub-6809573064811153";
const adSenseScriptId = "google-adsense";
const adSenseScriptUrl = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseClientId}`;

const appendAdSenseScript = () => {
	if (typeof document === "undefined") return;

	const head = document.querySelector("head");
	if (head?.querySelector(`#${adSenseScriptId}`)) return;

	const script = document.createElement("script");
	script.id = adSenseScriptId;
	script.async = true;
	script.src = adSenseScriptUrl;
	script.crossOrigin = "anonymous";
	head?.appendChild(script);
};

export const AdSense: React.FC<AdsenseProps> = ({
	slot = "3138091970",
	format = "fluid",
	responsive = "true",
	layoutKey = "-fb+5w+4e-db+86",
	className,
}) => {
	const adMode = useAtomValue(adModeAtom);
	return adMode ? (
		<InnerAdSense
			slot={slot}
			format={format}
			responsive={responsive}
			layoutKey={layoutKey}
			className={className}
		/>
	) : null;
};

const InnerAdSense: React.FC<AdsenseProps> = ({
	slot,
	format,
	responsive,
	layoutKey,
	className,
}) => {
	useEffect(() => {
		if (typeof window === "undefined") return;

		appendAdSenseScript();

		try {
			window.adsbygoogle = window.adsbygoogle || [];
			window.adsbygoogle.push({});
		} catch (e) {
			console.error(e);
		}
	}, []);

	return (
		<div className={clsx("text-center", className)}>
			<ins
				className="adsbygoogle block"
				data-ad-client={adSenseClientId}
				data-ad-slot={slot}
				data-ad-format={format}
				data-full-width-responsive={responsive}
				data-ad-layout-key={layoutKey}
			/>
		</div>
	);
};

export default AdSense;
