import type { PropsWithChildren } from "react";

import styles from "./DetailItemText.module.css";

const DetailItemText: React.FC<
	PropsWithChildren<{ label: React.ReactNode; icon?: React.ReactNode }>
> = ({ label, icon, children }) => {
	return (
		<div className={styles.row}>
			<div className={styles.label}>{label}</div>
			<div className={styles.icon}>{icon}</div>
			<div className={styles.value}>{children}</div>
		</div>
	);
};
export default DetailItemText;
