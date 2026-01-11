import type React from "react";
import { Button } from "../atoms/Button";
import { Paper } from "../atoms/Paper";

export const ErrorFallback: React.FC<{
	error: Error;
	resetErrorBoundary?: () => void;
}> = ({ error, resetErrorBoundary }) => {
	return (
		<Paper className="p-4 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 border">
			<div className="flex flex-col gap-2">
				<h2 className="text-lg font-bold text-red-700 dark:text-red-400">
					エラーが発生しました
				</h2>
				<p className="text-sm text-red-600 dark:text-red-300 font-mono overflow-auto max-h-40">
					{error.message}
				</p>
				{resetErrorBoundary && (
					<div className="mt-2">
						<Button onClick={resetErrorBoundary} color="primary">
							再試行
						</Button>
					</div>
				)}
			</div>
		</Paper>
	);
};

export default ErrorFallback;
