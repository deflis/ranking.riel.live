import { useAtom } from "jotai";
import React, { useCallback, useEffect, useState } from "react";
import { FaHammer, FaTrophy } from "react-icons/fa";
import { HiMenu } from "react-icons/hi";
import { useToggle } from "react-use";

import { Link as RouterLink, useNavigate } from "react-router-dom";

import {
  adModeAtom,
  darkModeAtom,
  showKeywordAtom,
  titleHeightAtom,
} from "../../../modules/atoms/global";
import { useHandleChange } from "../../../modules/utils/useHandleChange";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Divider, Sidebar, SidebarItem } from "../atoms/Sidebar";
import { TextField } from "../atoms/TextField";
import { AdDialog } from "./AdDialog";
import NumberTextField from "./NumberTextField";

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
      navigate(`/detail/${ncode}`);
    },
    [navigate, ncode]
  );

  const handleChangeNcode = useHandleChange(setNcode);
  const [expand, toggle] = useToggle(false);
  const [darkmode, setDarkmode] = useAtom(darkModeAtom);
  const toggleDarkmode = useCallback(
    () => setDarkmode((x) => !x),
    [setDarkmode]
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
    titleHeightRaw > 0 ? titleHeightRaw : 2
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
    [setShowKeyword]
  );

  return (
    <header>
      <nav className="shadow-md py-2 bg-stone-100 relative flex items-center w-full justify-between dark:bg-neutral-900">
        <button
          className="rounded-full hover:bg-stone-300 dark:hover:bg-neutral-800  w-10 h-10"
          onClick={toggle}
        >
          <HiMenu className="w-5 h-5 m-auto" />
        </button>
        <h6>
          <RouterLink to="/" className="link-reset hover:underline">
            <FaTrophy className="w-5 h-5 inline" />
            なろうランキング
          </RouterLink>
        </h6>
        <div className="grow" />
        <div className="space-x-4 mx-2 hidden sm:block">
          <RouterLink to="/ranking/d">日間</RouterLink>
          <RouterLink to="/ranking/w">週間</RouterLink>
          <RouterLink to="/ranking/m">月間</RouterLink>
          <RouterLink to="/custom">カスタムランキング</RouterLink>
        </div>
      </nav>
      <Sidebar open={expand} onClose={toggle}>
        <RouterLink to="/ranking/d">
          <SidebarItem as="a" hover>
            日間
          </SidebarItem>
        </RouterLink>
        <RouterLink to="/ranking/w">
          <SidebarItem as="a" hover>
            週間
          </SidebarItem>
        </RouterLink>
        <RouterLink to="/ranking/m">
          <SidebarItem as="a" hover>
            月間
          </SidebarItem>
        </RouterLink>
        <RouterLink to="/ranking/q">
          <SidebarItem as="a" hover>
            四半期
          </SidebarItem>
        </RouterLink>
        <Divider />
        <RouterLink to="/custom">
          <SidebarItem as="a" hover>
            カスタムランキング
          </SidebarItem>
        </RouterLink>
        <Divider />
        <RouterLink to="/custom/y">
          <SidebarItem as="a" hover>
            年間
            <br />
            カスタムランキング
          </SidebarItem>
        </RouterLink>
        <RouterLink to="/custom/a">
          <SidebarItem as="a" hover>
            全期間
            <br />
            カスタムランキング
          </SidebarItem>
        </RouterLink>
        <RouterLink to="/custom/u">
          <SidebarItem as="a" hover>
            週間ユニークユーザー数
            <br />
            カスタムランキング
          </SidebarItem>
        </RouterLink>
        <RouterLink to="/custom/d?genres=201">
          <SidebarItem as="a" hover>
            日間ハイファンタジー
            <br />
            カスタムランキング
          </SidebarItem>
        </RouterLink>
        <RouterLink to="/custom/d?genres=101">
          <SidebarItem as="a" hover>
            日間異世界恋愛
            <br />
            カスタムランキング
          </SidebarItem>
        </RouterLink>
        <RouterLink to="/custom/d?genres=102">
          <SidebarItem as="a" hover>
            日間現実世界恋愛
            <br />
            カスタムランキング
          </SidebarItem>
        </RouterLink>
        <Divider />
        <RouterLink to="/r18">
          <SidebarItem as="a" hover>
            R18ランキング
          </SidebarItem>
        </RouterLink>
        <Divider />
        <RouterLink to="/about">
          <SidebarItem as="a" hover>
            このサイトについて
          </SidebarItem>
        </RouterLink>
        <Divider />
        <SidebarItem as="label">
          <Checkbox checked={darkmode} onClick={toggleDarkmode} />
          ダークモード
        </SidebarItem>
        <SidebarItem as="label">
          <Checkbox
            checked={titleHeightStatus}
            onClick={toggleTitleHeightStatus}
          />
          タイトルの高さを指定する
          {titleHeightStatus && (
            <NumberTextField
              value={titleHeight ?? 2}
              onChange={setTitleHeight}
              disabled={!titleHeightStatus}
              className="w-20 ml-2"
            />
          )}
        </SidebarItem>
        <SidebarItem>
          <label>
            <Checkbox checked={!showKeyword} onChange={toggleShowKeyword} />
            キーワードを表示しない
          </label>
        </SidebarItem>
        <SidebarItem>
          <label>
            <Checkbox checked={!adMode} onChange={handleAdMode} />
            広告を表示しない
          </label>
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
      <AdDialog
        open={showAdDialog}
        handleCancel={toggleAdDialog}
        handleOk={removeAd}
      />
    </header>
  );
};
