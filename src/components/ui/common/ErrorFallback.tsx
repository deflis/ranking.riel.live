import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import type { ErrorComponentProps } from "@tanstack/react-router";
import type React from "react";

import { Button } from "../atoms/Button";
import { Paper } from "../atoms/Paper";

import styles from "./ErrorFallback.module.css";

export const ErrorFallback: React.FC<ErrorComponentProps> = ({
	error,
	reset,
}) => {
	const { reset: resetQueries } = useQueryErrorResetBoundary();
	const handleRetry = () => {
		resetQueries();
		reset();
	};

	return (
		<Paper className={styles.panel}>
			<div className={styles.content}>
				<h2 className={styles.title}>エラーが発生しました</h2>
				<p className={styles.message}>{(error as Error)?.message}</p>
				<div className={styles.actions}>
					<Button onClick={handleRetry} color="primary">
						再試行
					</Button>
				</div>
			</div>
		</Paper>
	);
};

export default ErrorFallback;
