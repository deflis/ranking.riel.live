import type React from "react";

import Ad from "./ad.jpg";

import styles from "./SelfAd.module.css";

export const SelfAd: React.FC = () => {
	return (
		<div className={styles.container}>
			<a href="https://riel.live" target="_blank" rel="noreferrer">
				<img
					className={styles.image}
					src={Ad}
					alt="私が作りました"
					width={970}
					height={250}
					decoding="async"
					loading="lazy"
				/>
			</a>
		</div>
	);
};
