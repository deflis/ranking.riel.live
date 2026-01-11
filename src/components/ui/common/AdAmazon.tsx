import { useAtomValue } from "jotai";
import React from "react";
import { useEffectOnce } from "@/hooks/useEffectOnce";
import { useMedia } from "@/hooks/useMedia";

import { adModeAtom } from "../../../modules/atoms/global";

const AdAmazon728x90: React.FC = () => {
	return (
		<iframe
			className="m-auto"
			title="Amazon広告"
			src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=48&l=ez&f=ifr&linkID=50fa90484170d3f8a8218a6b11bc21ca&t=riel011-22&tracking_id=riel011-22"
			width="728"
			height="90"
			scrolling="no"
		/>
	);
};

const AdAmazon468x60: React.FC = () => {
	return (
		<iframe
			className="m-auto max-w-lg"
			title="Amazon広告"
			src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=13&l=ez&f=ifr&linkID=45eedac80204e7d9ae479f497dd6013c&t=riel011-22&tracking_id=riel011-22"
			width="468"
			height="60"
			scrolling="no"
		/>
	);
};
const AdAmazon180x150: React.FC = () => {
	return (
		<iframe
			className="m-auto max-w-lg"
			title="Amazon広告"
			src="https://rcm-fe.amazon-adsystem.com/e/cm?o=9&p=9&l=ez&f=ifr&linkID=d5d233b3cf96a106aca1f58181777280&t=riel011-22&tracking_id=riel011-22"
			width="180"
			height="150"
			scrolling="no"
		/>
	);
};

export const AdAmazonWidth: React.FC = () => {
	const adMode = useAtomValue(adModeAtom);

	const matches = useMedia("(min-width:728px)");
	const matches2 = useMedia("(min-width:468px)");
	return (
		<>
			{adMode && (
				<div>
					{matches && <AdAmazon728x90 />}
					{!matches && matches2 && <AdAmazon468x60 />}
					{!matches2 && <AdAmazon180x150 />}
				</div>
			)}
		</>
	);
};

declare global {
	interface Window {
		amzn_assoc_tracking_id: string;
		amzn_assoc_ad_type: string;
		amzn_assoc_linkid: string;
		amzn_assoc_placement: string;
		amzn_assoc_marketplace: string;
		amzn_assoc_region: string;
	}
}
export const PropOver: React.FC = () => {
	const adMode = useAtomValue(adModeAtom);
	useEffectOnce(() => {
		if (!window) return;
		if (adMode) {
			window.amzn_assoc_ad_type = "link_enhancement_widget";
			window.amzn_assoc_tracking_id = "riel011-22";
			window.amzn_assoc_linkid = "77015d67c4bcdd9353d9c9f7dcec22fb";
			window.amzn_assoc_placement = "";
			window.amzn_assoc_marketplace = "amazon";
			window.amzn_assoc_region = "JP";
			const head = document.querySelector("head");

			if (!head?.querySelector("#amazon-ad")) {
				const script = document.createElement("script");
				script.id = "amazon-ad";
				script.type = "text/javascript";
				script.src =
					"//ws-fe.amazon-adsystem.com/widgets/q?ServiceVersion=20070822&Operation=GetScript&ID=OneJS&WS=1&MarketPlace=JP";
				head?.appendChild(script);
			}
		}
	});

	return <></>;
};
