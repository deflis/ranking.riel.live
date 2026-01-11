import { useToggle } from "@/hooks/useToggle";
import { Link, createLink, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import { Suspense, useCallback, useEffect, useState } from "react";
import { FaHammer, FaTrophy } from "react-icons/fa";
import { HiMenu } from "react-icons/hi";

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

const SidebarItemLink = createLink(SidebarItem);
const validateRegexp = /[nN][0-9]{4,}[a-zA-Z]{1,2}/;

function validate(ncode: string): boolean {
	return validateRegexp.test(ncode);
}

export const Header: React.FC = () => {
	const [ncode, setNcode] = useState("");
	const navigate = useNavigate();
	const detail = useCallback(
		(e: { preventDefault: () => void }) => {
			e.preventDefault();
			if (!validate(ncode)) {
				return;
			}
			navigate({ to: "/detail/$ncode", params: { ncode } });
		},
		[navigate, ncode],
	);

	const handleChangeNcode = useHandleChange(setNcode);
	const [expand, toggle] = useToggle(false);
	const [darkmode, setDarkmode] = useAtom(darkModeAtom);
	const toggleDarkmode = useCallback(
		() => setDarkmode((x) => !x),
		[setDarkmode],
	);
	const [adMode, setAdMode] = useAtom(adModeAtom);
	const [showAdDialog, toggleAdDialog] = useToggle(false);
	const handleAdMode = useCallback(() => {
		if (adMode) {
			toggleAdDialog();
		} else {
			setAdMode(true);
		}
	}, [adMode, toggleAdDialog, setAdMode]);
	const removeAd = useCallback(() => {
		setAdMode(false);
		toggleAdDialog();
	}, [setAdMode, toggleAdDialog]);
	const [titleHeightRaw, setTitleHeightRaw] = useAtom(titleHeightAtom);
	const [titleHeight, setTitleHeight] = useState(
		titleHeightRaw > 0 ? titleHeightRaw : 2,
	);
	const titleHeightStatus = !!titleHeightRaw && titleHeightRaw > 0;
	const toggleTitleHeightStatus = useCallback(() => {
		if (!titleHeightStatus) {
			setTitleHeightRaw(titleHeight);
		} else {
			setTitleHeightRaw(0);
		}
	}, [titleHeightStatus, setTitleHeightRaw, titleHeight]);
	useEffect(() => {
		if (titleHeightStatus) {
			setTitleHeightRaw(titleHeight);
		}
	}, [titleHeightStatus, titleHeight, setTitleHeightRaw]);
	const [showKeyword, setShowKeyword] = useAtom(showKeywordAtom);
	const toggleShowKeyword = useCallback(
		() => setShowKeyword((x) => !x),
		[setShowKeyword],
	);

	const handleChangeHeight = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = Number.parseInt(e.target.value, 10);
			if (value > 0) {
				setTitleHeight(value);
			}
		},
		[],
	);

	return (
		<header>
			<nav className="shadow-md py-2 bg-stone-100 relative flex items-center w-full justify-between dark:bg-neutral-900">
				<button
					type="button"
					className="rounded-full hover:bg-stone-300 dark:hover:bg-neutral-800  w-10 h-10"
					onClick={toggle}
				>
					<HiMenu className="w-5 h-5 m-auto" />
				</button>
				<h6>
					<Link to="/" className="link-reset hover:underline">
						<FaTrophy className="w-5 h-5 inline" />
						なろうランキング
					</Link>
				</h6>
				<div className="grow" />
				<div className="space-x-4 mx-2 hidden sm:block">
					<Link
						to="/ranking/{-$type}/{-$date}"
						params={{ type: RankingType.Daily }}
					>
						{RankingTypeName[RankingType.Daily]}
					</Link>
					<Link
						to="/ranking/{-$type}/{-$date}"
						params={{ type: RankingType.Weekly }}
					>
						{RankingTypeName[RankingType.Weekly]}
					</Link>
					<Link
						to="/ranking/{-$type}/{-$date}"
						params={{ type: RankingType.Monthly }}
					>
						{RankingTypeName[RankingType.Monthly]}
					</Link>
					<Link to="/custom/{-$type}" params={{ type: RankingType.Daily }}>
						カスタムランキング
					</Link>
				</div>
			</nav>
			<Sidebar open={expand} onClose={toggle}>
				<SidebarItemLink
					to="/ranking/{-$type}/{-$date}"
					params={{ type: RankingType.Daily }}
					hover
				>
					{RankingTypeName[RankingType.Daily]}
				</SidebarItemLink>
				<SidebarItemLink
					to="/ranking/{-$type}/{-$date}"
					params={{ type: RankingType.Weekly }}
					hover
				>
					{RankingTypeName[RankingType.Weekly]}
				</SidebarItemLink>
				<SidebarItemLink
					to="/ranking/{-$type}/{-$date}"
					params={{ type: RankingType.Monthly }}
					hover
				>
					{RankingTypeName[RankingType.Monthly]}
				</SidebarItemLink>
				<SidebarItemLink
					to="/ranking/{-$type}/{-$date}"
					params={{ type: RankingType.Quarter }}
					hover
				>
					{RankingTypeName[RankingType.Quarter]}
				</SidebarItemLink>
				<Divider />
				<SidebarItemLink
					to="/custom/{-$type}"
					params={{ type: RankingType.Daily }}
					hover
				>
					カスタムランキング
				</SidebarItemLink>
				<Divider />
				<SidebarItemLink
					to="/custom/{-$type}"
					params={{ type: RankingType.Yearly }}
					hover
				>
					{RankingTypeName[RankingType.Yearly]}
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					to="/custom/{-$type}"
					params={{ type: RankingType.All }}
					hover
				>
					{RankingTypeName[RankingType.All]}
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					to="/custom/{-$type}"
					params={{ type: RankingType.UniqueUser }}
					hover
				>
					{RankingTypeName[RankingType.UniqueUser]}
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					to="/custom/{-$type}"
					params={{ type: RankingType.Daily }}
					search={{ genres: "201" }}
					hover
				>
					日間ハイファンタジー
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					to="/custom/{-$type}"
					params={{ type: RankingType.Daily }}
					search={{ genres: "101" }}
					hover
				>
					日間異世界恋愛
					<br />
					カスタムランキング
				</SidebarItemLink>
				<SidebarItemLink
					to="/custom/{-$type}"
					params={{ type: RankingType.Daily }}
					search={{ genres: "102" }}
					hover
				>
					日間現実世界恋愛
					<br />
					カスタムランキング
				</SidebarItemLink>
				<Divider />
				<SidebarItemLink to="/r18" hover>
					R18ランキング
				</SidebarItemLink>
				<Divider />
				<SidebarItemLink to="/about" hover>
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
							className="w-20 ml-2"
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
				<SidebarItem as="form" className="flex" onSubmit={detail}>
					<label>
						Nコード
						<TextField
							onChange={handleChangeNcode}
							value={ncode}
							className="w-20"
						/>
					</label>
					<Button disabled={!validate(ncode)} onClick={detail}>
						<FaHammer className="w-5 h-5 inline" />
						詳細を取得
					</Button>
				</SidebarItem>
			</Sidebar>
			<Suspense>
				<AdDialog
					open={showAdDialog}
					handleCancel={toggleAdDialog}
					handleOk={removeAd}
				/>
			</Suspense>
		</header>
	);
};
