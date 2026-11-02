import {
	CatchBoundary,
	Link,
	createLink,
	useNavigate,
} from "@tanstack/react-router";
import { useAtom } from "jotai";
import { Genre } from "narou";
import { Suspense, useEffect, useState } from "react";
import { FaHammer, FaTrophy } from "react-icons/fa";
import { HiMenu } from "react-icons/hi";

import { useToggle } from "@/hooks/useToggle";
import { buildCustomRankingSearch } from "@/modules/utils/parseSearch";

import {
	adModeAtom,
	darkModeAtom,
	showKeywordAtom,
	titleHeightAtom,
} from "../../../modules/atoms/global";
import {
	RankingType,
	RankingTypeName,
} from "../../../modules/interfaces/RankingType";
import { useHandleChange } from "../../../modules/utils/useHandleChange";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Divider, Sidebar, SidebarItem } from "../atoms/Sidebar";
import { TextField } from "../atoms/TextField";
import { AdDialog } from "../common/AdDialog";

import styles from "./Header.module.css";

const SidebarItemLink = createLink(SidebarItem);
const validateRegexp = /[nN][0-9]{4,}[a-zA-Z]{1,2}/;

function validate(ncode: string): boolean {
	return validateRegexp.test(ncode);
}

export const Header: React.FC = () => {
	const [ncode, setNcode] = useState("");
	const [expand, toggle] = useToggle(false);
	const closeSidebarOnNavigate = (event: React.MouseEvent) => {
		if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
			toggle(false);
		}
	};
	const navigate = useNavigate();
	const detail = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		if (!validate(ncode)) {
			return;
		}
		navigate({ to: "/detail/$ncode", params: { ncode } });
		toggle(false);
	};

	const handleChangeNcode = useHandleChange(setNcode);
	const [darkmode, setDarkmode] = useAtom(darkModeAtom);
	const toggleDarkmode = () => setDarkmode((x) => !x);
	const [adMode, setAdMode] = useAtom(adModeAtom);
	const [showAdDialog, toggleAdDialog] = useToggle(false);
	const handleAdMode = () => {
		if (adMode) {
			toggleAdDialog();
		} else {
			setAdMode(true);
		}
	};
	const removeAd = () => {
		setAdMode(false);
		toggleAdDialog();
	};
	const [titleHeightRaw, setTitleHeightRaw] = useAtom(titleHeightAtom);
	const [titleHeight, setTitleHeight] = useState(
		titleHeightRaw > 0 ? titleHeightRaw : 2,
	);
	const titleHeightStatus = !!titleHeightRaw && titleHeightRaw > 0;
	const toggleTitleHeightStatus = () => {
		if (!titleHeightStatus) {
			setTitleHeightRaw(titleHeight);
		} else {
			setTitleHeightRaw(0);
		}
	};
	useEffect(() => {
		if (titleHeightRaw > 0) {
			setTitleHeight(titleHeightRaw);
		}
	}, [titleHeightRaw]);
	const [showKeyword, setShowKeyword] = useAtom(showKeywordAtom);
	const toggleShowKeyword = () => setShowKeyword((x) => !x);

	const handleChangeHeight = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value, 10);
		if (value > 0) {
			setTitleHeight(value);
			if (titleHeightStatus) {
				setTitleHeightRaw(value);
			}
		}
	};

	return (
		<header>
			<nav className={styles.navigation}>
				<button
					type="button"
					aria-label="メニューを開く"
					aria-expanded={expand}
					className={styles.menuButton}
					onClick={toggle}
				>
					<HiMenu className={styles.menuIcon} />
				</button>
				<h6>
					<Link to="/" className={["link-reset", styles.homeLink].join(" ")}>
						<FaTrophy className={styles.icon} />
						なろうランキング
					</Link>
				</h6>
				<div className={styles.spacer} />
				<div className={styles.links}>
					<Link
						to="/ranking/{-$type}/{-$date}"
						params={(prev) => ({
							...prev,
							type: RankingType.Daily,
							date: undefined,
						})}
					>
						{RankingTypeName[RankingType.Daily]}
					</Link>
					<Link
						to="/ranking/{-$type}/{-$date}"
						params={(prev) => ({
							...prev,
							type: RankingType.Weekly,
							date: undefined,
						})}
					>
						{RankingTypeName[RankingType.Weekly]}
					</Link>
					<Link
						to="/ranking/{-$type}/{-$date}"
						params={(prev) => ({
							...prev,
							type: RankingType.Monthly,
							date: undefined,
						})}
					>
						{RankingTypeName[RankingType.Monthly]}
					</Link>
					<Link
						to="/custom/{-$type}"
						params={(prev) => ({ ...prev, type: RankingType.Daily })}
						search={(_) => ({})}
					>
						カスタムランキング
					</Link>
				</div>
			</nav>
			<Sidebar open={expand} onClose={toggle}>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/ranking/{-$type}/{-$date}"
					params={(prev) => ({
						...prev,
						type: RankingType.Daily,
						date: undefined,
					})}
					hover
				>
					{RankingTypeName[RankingType.Daily]}
				</SidebarItemLink>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/ranking/{-$type}/{-$date}"
					params={(prev) => ({
						...prev,
						type: RankingType.Weekly,
						date: undefined,
					})}
					hover
				>
					{RankingTypeName[RankingType.Weekly]}
				</SidebarItemLink>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/ranking/{-$type}/{-$date}"
					params={(prev) => ({
						...prev,
						type: RankingType.Monthly,
						date: undefined,
					})}
					hover
				>
					{RankingTypeName[RankingType.Monthly]}
				</SidebarItemLink>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/ranking/{-$type}/{-$date}"
					params={(prev) => ({
						...prev,
						type: RankingType.Quarter,
						date: undefined,
					})}
					hover
				>
					{RankingTypeName[RankingType.Quarter]}
				</SidebarItemLink>
				<Divider />
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/custom/{-$type}"
					params={(prev) => ({ ...prev, type: RankingType.Daily })}
					search={(_) => ({})}
					hover
				>
					カスタムランキング
				</SidebarItemLink>
				<Divider />
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/custom/{-$type}"
					params={(prev) => ({ ...prev, type: RankingType.Yearly })}
					search={(_) => ({})}
					hover
				>
					{RankingTypeName[RankingType.Yearly]}
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/custom/{-$type}"
					params={(prev) => ({ ...prev, type: RankingType.All })}
					search={(_) => ({})}
					hover
				>
					{RankingTypeName[RankingType.All]}
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/custom/{-$type}"
					params={(prev) => ({ ...prev, type: RankingType.UniqueUser })}
					search={(_) => ({})}
					hover
				>
					{RankingTypeName[RankingType.UniqueUser]}
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/custom/{-$type}"
					params={(prev) => ({ ...prev, type: RankingType.Daily })}
					search={(_) =>
						buildCustomRankingSearch({ genres: [Genre.FantasyHigh] })
					}
					hover
				>
					日間ハイファンタジー
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/custom/{-$type}"
					params={(prev) => ({ ...prev, type: RankingType.Daily })}
					search={(_) =>
						buildCustomRankingSearch({ genres: [Genre.RenaiIsekai] })
					}
					hover
				>
					日間異世界恋愛
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/custom/{-$type}"
					params={(prev) => ({ ...prev, type: RankingType.Daily })}
					search={(_) =>
						buildCustomRankingSearch({ genres: [Genre.RenaiGenjitsusekai] })
					}
					hover
				>
					日間現実世界恋愛
					<br />
					カスタムランキング
				</SidebarItemLink>
				<Divider />
				<SidebarItemLink
					onClick={closeSidebarOnNavigate}
					to="/r18"
					search={(_) => ({})}
					hover
				>
					R18ランキング
				</SidebarItemLink>
				<Divider />
				<SidebarItemLink onClick={closeSidebarOnNavigate} to="/about" hover>
					このサイトについて
				</SidebarItemLink>
				<Divider />
				<SidebarItem as="label">
					<Checkbox checked={darkmode} onChange={toggleDarkmode} />
					ダークモード
				</SidebarItem>
				<SidebarItem as="label">
					<Checkbox
						checked={titleHeightStatus}
						onChange={toggleTitleHeightStatus}
					/>
					タイトルの高さを指定する
					{titleHeightStatus && (
						<TextField
							min={1}
							value={titleHeight ?? 2}
							type="number"
							onChange={handleChangeHeight}
							disabled={!titleHeightStatus}
							className={styles.titleHeightInput}
						/>
					)}
				</SidebarItem>
				<SidebarItem as="label">
					<Checkbox checked={!showKeyword} onChange={toggleShowKeyword} />
					キーワードを表示しない
				</SidebarItem>
				<SidebarItem as="label">
					<Checkbox checked={!adMode} onChange={handleAdMode} />
					広告を表示しない
				</SidebarItem>
				<Divider />
				<SidebarItem as="form" onSubmit={detail}>
					<label>
						Nコード
						<TextField
							onChange={handleChangeNcode}
							value={ncode}
							className={styles.ncodeInput}
						/>
					</label>
					<Button disabled={!validate(ncode)} onClick={detail}>
						<FaHammer className={styles.icon} />
						詳細を取得
					</Button>
				</SidebarItem>
			</Sidebar>
			<CatchBoundary getResetKey={() => ""} errorComponent={() => null}>
				<Suspense>
					<AdDialog
						open={showAdDialog}
						handleCancel={toggleAdDialog}
						handleOk={removeAd}
					/>
				</Suspense>
			</CatchBoundary>
		</header>
	);
};
