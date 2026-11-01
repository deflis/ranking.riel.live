import type { ReactElement } from "react";

import { chunk } from "@/modules/utils/chunk";

import styles from "./RankingRows.module.css";

// 描画省略は行に限定し、カード同士が共有するsubgridは内側に保つ。
export function RankingRows({ items }: { items: ReactElement[] }) {
	return chunk(items, 2).map((pair) => (
		<div key={pair[0].key} className={styles.row} data-ranking-row>
			{pair}
		</div>
	));
}
