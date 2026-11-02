import { Link, createLink } from "@tanstack/react-router";
import { GenreNotation, NovelType, R18SiteNotation } from "narou";
import type { FC } from "react";
import { FaPenNib } from "react-icons/fa";
import {
	HiBookmark,
	HiCalendar,
	HiChatAlt,
	HiGlobeAlt,
	HiPencilAlt,
	HiThumbUp,
} from "react-icons/hi";
import { IoLanguage, IoTime } from "react-icons/io5";

import { RankingType } from "@/modules/interfaces/RankingType";
import { decodeNarouText } from "@/modules/utils/decodeNarouText";
import {
	buildCustomRankingSearch,
	buildR18RankingSearch,
} from "@/modules/utils/parseSearch";
import {
	parseDateTime,
	formatDateTime,
	formatRelative,
} from "@/modules/utils/temporal";

import type {
	Detail,
	Item,
	NocDetail,
	NocItem,
} from "../../../modules/data/types";
import { Button } from "../atoms/Button";
import { Chip } from "../atoms/Chip";
import { PulseLoader } from "../atoms/Loader";
import { Paper } from "../atoms/Paper";
import { AdRandomWidth } from "../common/AdRandom";
import AdSense from "../common/AdSense";
import ItemBadge from "../common/badges/ItemBadge";
import { Tag } from "../common/bulma/Tag";
import { FirstAd } from "../common/FirstAd";
import StoryRender from "../common/StoryRender";
import DetailItemText from "./DetailItemText";

import styles from "./DetailItem.module.css";

const ChipLink = createLink(Chip);

/**
 * JavaScript の計算誤差（0.615 が内部で 0.61499... になる等）を避け、
 * 期待通りに四捨五入を行うヘルパー。
 *
 * @example round(0.615, 2) // => 0.62 (通常の Math.round だと 0.61 になる場合がある)
 */
function round(number: number, precision: number): number {
	/**
	 * @param n 対象の数値
	 * @param p シフトする桁数 (精度)
	 * @param isReverse 反転フラグ (false: 整数側へシフト, true: 小数側へ戻す)
	 */
	const shift = (n: number, p: number, isReverse: boolean) => {
		const adj = isReverse ? -p : p;
		const [base, exp] = `${n}`.split("e");
		// 指数部を加減して桁をずらす (例: 0.615 -> "0.615e2" -> 61.5)
		return +`${base}e${exp ? +exp + adj : adj}`;
	};

	// 1. 小数点を右にずらして整数化 (0.615 -> 61.5)
	// 2. Math.round で四捨五入 (61.5 -> 62)
	// 3. 小数点を左に戻して元のスケールへ (62 -> 0.62)
	return shift(Math.round(shift(number, precision, false)), precision, true);
}

function checkR18(
	isR18: boolean,
	item: Item | NocItem | null | undefined,
): item is NocItem {
	return isR18 && (item == null || (item as NocItem)?.nocgenre !== undefined);
}

const DetailItem: FC<{
	ncode: string;
	item: Item | NocItem | null | undefined;
	detail: Detail | NocDetail | null | undefined;
	isNotFound: boolean;
	isR18?: true;
}> = ({
	ncode: rawNcode,
	item,
	detail: detailItem,
	isNotFound,
	isR18: rawR18 = false,
}) => {
	const isR18 = checkR18(rawR18, item);
	const baseUrl = isR18
		? "https://novel18.syosetu.com"
		: "https://ncode.syosetu.com";
	const ncode = (item?.ncode ?? rawNcode).toLowerCase();
	const detail = `${baseUrl}/novelview/infotop/ncode/${ncode}/`;
	const link = `${baseUrl}/${ncode}/`;
	const linkFirst = `${baseUrl}/${ncode}/1/`;
	const linkLast = `${baseUrl}/${ncode}/${item?.general_all_no}/`;

	const generalFirstup = item?.general_firstup
		? parseDateTime(item.general_firstup)
		: undefined;
	const generalLastup = item?.general_lastup
		? parseDateTime(item.general_lastup)
		: undefined;

	return (
		<>
			<div>
				<p>
					<Tag
						className={styles.codeTag}
						as="a"
						href={link}
						target="_blank"
						rel="noopener noreferrer"
					>
						{ncode.toUpperCase()}
					</Tag>{" "}
					{item ? (
						!isR18 ? (
							<Link
								to="/custom/{-$type}"
								params={(prev) => ({ ...prev, type: RankingType.All })}
								search={(_) =>
									buildCustomRankingSearch({ genres: [item.genre] })
								}
								rel="noopener noreferrer"
							>
								{GenreNotation[item.genre]}
							</Link>
						) : (
							<Link
								to="/r18"
								params={(prev) => ({ ...prev })}
								search={(_) =>
									buildR18RankingSearch({ sites: [item.nocgenre] })
								}
								rel="noopener noreferrer"
							>
								{R18SiteNotation[item.nocgenre]}
							</Link>
						)
					) : (
						<PulseLoader
							className={styles.quarterLoader}
							disabled={isNotFound}
						/>
					)}
				</p>
				<h1 className={styles.title}>
					<a
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						className={["link-reset", styles.titleLink].join(" ")}
					>
						{item ? (
							decodeNarouText(item.title)
						) : isNotFound ? (
							"小説が見つかりません。削除された可能性があります。"
						) : (
							<PulseLoader className={styles.titleLoader} />
						)}
					</a>
				</h1>
				<p className={styles.small}>
					{item && <ItemBadge item={item} />}{" "}
					{!item || item.noveltype === NovelType.Tanpen ? (
						<a href={link} target="_blank" rel="noopener noreferrer">
							読む
						</a>
					) : (
						<>
							<a
								href={linkFirst}
								target="_blank"
								rel="noopener noreferrer"
								className={styles.link}
							>
								第1話を読む
							</a>{" "}
							|{" "}
							<a
								href={linkLast}
								target="_blank"
								rel="noopener noreferrer"
								className={styles.link}
							>
								最新話を読む
							</a>
						</>
					)}{" "}
					{item && (
						<Tag>
							{Math.round(item.length / item.general_all_no).toLocaleString()}
							文字/話
						</Tag>
					)}
				</p>
			</div>
			<FirstAd />
			<div className={styles.columns}>
				<div className={styles.storyColumn}>
					<h2 className={styles.heading}>あらすじ</h2>
					{item ? (
						<StoryRender story={item.story} className={styles.story} />
					) : (
						<div className={styles.story}>
							<PulseLoader disabled={isNotFound} />
						</div>
					)}
				</div>
				<div className={styles.metadata}>
					<DetailItemText
						label="作者"
						icon={<FaPenNib className={styles.icon} />}
					>
						{item ? (
							isR18 ? (
								decodeNarouText(item.writer)
							) : (
								<a
									href={`https://mypage.syosetu.com/${encodeURIComponent(item.userid)}/`}
									target="_blank"
									rel="noopener noreferrer"
								>
									{decodeNarouText(item.writer)}
								</a>
							)
						) : (
							<PulseLoader
								className={styles.halfLoader}
								disabled={isNotFound}
							/>
						)}
					</DetailItemText>
					{!isR18 && (
						<DetailItemText
							label="ジャンル"
							icon={<HiGlobeAlt className={styles.icon} />}
						>
							{item ? (
								<Link
									to="/custom/{-$type}"
									params={(prev) => ({ ...prev, type: RankingType.All })}
									search={(_) =>
										buildCustomRankingSearch({ genres: [item.genre] })
									}
								>
									{GenreNotation[item.genre]}
								</Link>
							) : (
								<PulseLoader
									className={styles.halfLoader}
									disabled={isNotFound}
								/>
							)}
						</DetailItemText>
					)}
					{isR18 && (
						<DetailItemText
							label="サイト"
							icon={<HiGlobeAlt className={styles.icon} />}
						>
							{item ? (
								<Link
									to="/r18"
									params={(prev) => ({ ...prev })}
									search={(_) =>
										buildR18RankingSearch({ sites: [item.nocgenre] })
									}
								>
									{R18SiteNotation[item.nocgenre]}
								</Link>
							) : (
								<PulseLoader
									className={styles.halfLoader}
									disabled={isNotFound}
								/>
							)}
						</DetailItemText>
					)}
					<DetailItemText label="キーワード">
						{item ? (
							<div className={styles.keywords}>
								{item.keyword
									.split(/\s/g)
									.filter((keyword) => keyword)
									.map((keyword) => (
										<ChipLink
											as="a"
											key={keyword}
											to={isR18 ? "/r18" : "/custom/{-$type}"}
											params={(prev) => ({ ...prev, type: RankingType.All })}
											search={(_) =>
												isR18
													? buildR18RankingSearch({ keyword })
													: buildCustomRankingSearch({ keyword })
											}
										>
											{keyword}
										</ChipLink>
									))}
							</div>
						) : (
							<PulseLoader disabled={isNotFound} />
						)}
					</DetailItemText>
					<DetailItemText
						label="掲載日"
						icon={<HiCalendar className={styles.icon} />}
					>
						{generalFirstup ? (
							<>
								{formatDateTime(generalFirstup, true)} （
								{formatRelative(generalFirstup)}）
							</>
						) : (
							<PulseLoader disabled={isNotFound} />
						)}
					</DetailItemText>
					<DetailItemText
						label="最新部分掲載日"
						icon={<IoTime className={styles.icon} />}
					>
						{generalLastup ? (
							<>
								{formatDateTime(generalLastup, true)} （
								{formatRelative(generalLastup)}）
							</>
						) : (
							<PulseLoader disabled={isNotFound} />
						)}
					</DetailItemText>
					<DetailItemText
						label="感想"
						icon={<HiChatAlt className={styles.icon} />}
					>
						{detailItem ? (
							<>{detailItem.impression_cnt.toLocaleString()}件</>
						) : (
							<PulseLoader disabled={isNotFound} />
						)}
					</DetailItemText>
					<DetailItemText
						label="レビュー"
						icon={<HiPencilAlt className={styles.icon} />}
					>
						{detailItem ? (
							<>{detailItem.review_cnt.toLocaleString()}件</>
						) : (
							<PulseLoader disabled={isNotFound} />
						)}
					</DetailItemText>
					<DetailItemText
						label="ブックマーク登録"
						icon={<HiBookmark className={styles.icon} />}
					>
						{detailItem ? (
							<>{detailItem.fav_novel_cnt.toLocaleString()}件</>
						) : (
							<PulseLoader disabled={isNotFound} />
						)}
					</DetailItemText>
					<DetailItemText
						label="総合評価"
						icon={<HiThumbUp className={styles.icon} />}
					>
						{detailItem ? (
							<>
								{detailItem.all_point.toLocaleString()}pt /{" "}
								{detailItem.all_hyoka_cnt.toLocaleString()}人 = 平均
								{round(
									detailItem.all_point / detailItem.all_hyoka_cnt,
									2,
								).toLocaleString()}
								pt
							</>
						) : (
							<PulseLoader disabled={isNotFound} />
						)}
					</DetailItemText>
					<DetailItemText
						label="文字数"
						icon={<IoLanguage className={styles.icon} />}
					>
						{item ? (
							<>
								{item.length.toLocaleString()}文字 / 全
								{item.general_all_no.toLocaleString()}話 ={" "}
								{Math.round(item.length / item.general_all_no).toLocaleString()}
								文字/話
							</>
						) : (
							<PulseLoader disabled={isNotFound} />
						)}
					</DetailItemText>
					<AdSense />
				</div>
			</div>
			<AdRandomWidth />
			<Paper className={styles.points}>
				<h2 className={styles.heading}>獲得ポイント</h2>
				<table className={styles.pointsTable}>
					<thead>
						<tr>
							<th>総合評価ポイント</th>
							<th>日間</th>
							<th>週間</th>
							<th>月間</th>
							<th>四半期</th>
							<th>年間</th>
							<th>週間UU</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className={styles.center}>
								{detailItem?.global_point.toLocaleString() ?? (
									<PulseLoader disabled={isNotFound} />
								)}
							</td>
							<td className={styles.center}>
								{detailItem?.daily_point.toLocaleString() ?? (
									<PulseLoader disabled={isNotFound} />
								)}
							</td>
							<td className={styles.center}>
								{detailItem?.weekly_point.toLocaleString() ?? (
									<PulseLoader disabled={isNotFound} />
								)}
							</td>
							<td className={styles.center}>
								{detailItem?.monthly_point.toLocaleString() ?? (
									<PulseLoader disabled={isNotFound} />
								)}
							</td>
							<td className={styles.center}>
								{detailItem?.quarter_point.toLocaleString() ?? (
									<PulseLoader disabled={isNotFound} />
								)}
							</td>
							<td className={styles.center}>
								{detailItem?.yearly_point.toLocaleString() ?? (
									<PulseLoader disabled={isNotFound} />
								)}
							</td>
							<td className={styles.center}>
								{detailItem?.weekly_unique.toLocaleString() ?? (
									<PulseLoader disabled={isNotFound} />
								)}
							</td>
						</tr>
					</tbody>
				</table>
			</Paper>
			<p className={styles.note}>
				<Button as="a" href={detail} target="_blank" rel="noopener noreferrer">
					小説情報
				</Button>{" "}
				<Button as="a" href={link} target="_blank" rel="noopener noreferrer">
					読む
				</Button>
			</p>
			<AdSense />
		</>
	);
};

export default DetailItem;
