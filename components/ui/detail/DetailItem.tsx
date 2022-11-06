import React from "react";
import {
  NarouSearchResult,
  NovelType,
  R18SiteNotation,
  Genre,
  GenreNotation,
} from "narou/src/index.browser";
import { decode } from "html-entities";
import { TwitterShare } from "../common/TwitterShare";
import AdSense from "../common/AdSense";
import { Tag, Tags } from "../common/bulma/Tag";
import StoryRender from "../common/StoryRender";
import DetailItemText from "./DetailItemText";
import ItemBadge from "../common/badges/ItemBadge";
// import { FirstAd } from "../common/FirstAd";
import { AdRandomWidth } from "../common/AdRandom";
import { ItemDetail, NocItemDetail } from "../../../modules/data/types";
import { Chip } from "../atoms/Chip";
import { Paper } from "../atoms/Paper";
import { Button } from "../atoms/Button";
import { Link as RouterLink } from "@tanstack/react-location";
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

const dateFormat = "yyyy年MM月dd日 hh:mm:ss";
function round(number: number, precision: number): number {
  const shift = function (
    number: number,
    precision: number,
    reverseShift: boolean
  ) {
    if (reverseShift) {
      precision = -precision;
    }
    const numArray = ("" + number).split("e");
    return +(
      numArray[0] +
      "e" +
      (numArray[1] ? +numArray[1] + precision : precision)
    );
  };
  return shift(Math.round(shift(number, precision, false)), precision, true);
}

function checkR18(item: ItemDetail | NocItemDetail): item is NocItemDetail {
  return (item as NocItemDetail).nocgenre !== undefined;
}

const DetailItem: React.FC<{ item: ItemDetail | NocItemDetail }> = ({
  item,
}) => {
  const isR18 = checkR18(item);
  const baseUrl = isR18
    ? "https://novel18.syosetu.com"
    : "https://ncode.syosetu.com";
  const ncode = item.ncode.toLowerCase();
  const detail = `${baseUrl}/novelview/infotop/ncode/${ncode}/`;
  const user = `https://mypage.syosetu.com/${item.userid}/`;
  const link = `${baseUrl}/${ncode}/`;
  const linkFirst = `${baseUrl}/${ncode}/1/`;
  const linkLast = `${baseUrl}/${ncode}/${item.general_all_no}/`;

  return (
    <>
      <div>
        <p>
          <Tag
            className="text-sm"
            as="a"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {item.ncode}
          </Tag>{" "}
          {!isR18 ? (
            <RouterLink
              to={`/custom?genres=${item.genre}`}
              rel="noopener noreferrer"
              className=""
            >
              {GenreNotation[item.genre]}
            </RouterLink>
          ) : (
            <RouterLink to={`/r18?genres=${item.nocgenre}`}>
              {R18SiteNotation[item.nocgenre]}
            </RouterLink>
          )}
        </p>
        <h1 className="text-4xl">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="link-reset hover:underline"
          >
            {decode(item.title)}
          </a>
        </h1>
        <p className="text-sm">
          <ItemBadge item={item} />{" "}
          {item.noveltype === NovelType.Tanpen ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              読む
            </a>
          ) : (
            <>
              <a
                href={linkFirst}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline dark:text-blue-400"
              >
                第1話を読む
              </a>{" "}
              |{" "}
              <a
                href={linkLast}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline dark:text-blue-400"
              >
                最新話を読む
              </a>
            </>
          )}{" "}
          <Tag>
            {Math.round(item.length / item.general_all_no).toLocaleString()}
            文字/話
          </Tag>
        </p>
      </div>
      {/*<FirstAd />*/}
      <div className="flex space-x-2 flex-col md:flex-row">
        <div className="w-full md:w-1/2 xl:w-7/12">
          <h2 className="text-xl">あらすじ</h2>
          <StoryRender
            story={item.story}
            className="bg-white p-2 md:max-h-screen overflow-auto dark:bg-zinc-800"
          />
        </div>
        <div className="w-full md:w-1/2 xl:w-5/12 shrink-0 m-0 p-2 text-sm space-y-2">
          <DetailItemText
            label="作者"
            icon={<FaPenNib className="w-3 h-3 inline" />}
          >
            {isR18 ? (
              decode(item.writer)
            ) : (
              <a href={user} target="_blank" rel="noopener noreferrer">
                {decode(item.writer)}
              </a>
            )}
          </DetailItemText>
          {!isR18 && (
            <DetailItemText
              label="ジャンル"
              icon={<HiGlobeAlt className="w-3 h-3 inline" />}
            >
              <RouterLink to={`/custom?genres=${item.genre}`}>
                {GenreNotation[item.genre]}
              </RouterLink>
            </DetailItemText>
          )}
          {isR18 && (
            <DetailItemText label="サイト">
              <RouterLink to={`/r18?genres=${item.nocgenre}`}>
                {R18SiteNotation[item.nocgenre]}
              </RouterLink>
            </DetailItemText>
          )}
          <DetailItemText label="キーワード">
            <div className="inline-flex flex-wrap items-center justify-start ">
              {item.keyword
                .split(/\s/g)
                .filter((keyword) => keyword)
                .map((keyword, i) => (
                  <Chip
                    as={RouterLink}
                    key={i}
                    to={
                      isR18
                        ? `/r18?keyword=${keyword}`
                        : `/custom?keyword=${keyword}`
                    }
                  >
                    {keyword}
                  </Chip>
                ))}
            </div>
          </DetailItemText>
          <DetailItemText
            label="掲載日"
            icon={<HiCalendar className="w-3 h-3 inline" />}
          >
            {item.general_firstup.toFormat(dateFormat)} （
            {item.general_firstup.toRelative()}）
          </DetailItemText>
          <DetailItemText
            label="最新部分掲載日"
            icon={<IoTime className="w-3 h-3 inline" />}
          >
            {item.general_lastup.toFormat(dateFormat)} （
            {item.general_lastup.toRelative()}）
          </DetailItemText>
          <DetailItemText
            label="感想"
            icon={<HiChatAlt className="w-3 h-3 inline" />}
          >
            {item.impression_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText
            label="レビュー"
            icon={<HiPencilAlt className="w-3 h-3 inline" />}
          >
            {item.review_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText
            label="ブックマーク登録"
            icon={<HiBookmark className="w-3 h-3 inline" />}
          >
            {item.fav_novel_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText
            label="総合評価"
            icon={<HiThumbUp className="w-3 h-3 inline" />}
          >
            {item.all_point.toLocaleString()}pt /{" "}
            {item.all_hyoka_cnt.toLocaleString()}人 = 平均
            {round(item.all_point / item.all_hyoka_cnt, 2).toLocaleString()}
            pt
          </DetailItemText>
          <DetailItemText
            label="文字数"
            icon={<IoLanguage className="w-3 h-3 inline" />}
          >
            {item.length.toLocaleString()}文字 / 全
            {item.general_all_no.toLocaleString()}話 ={" "}
            {Math.round(item.length / item.general_all_no).toLocaleString()}
            文字/話
          </DetailItemText>
          <AdSense></AdSense>
        </div>
      </div>
      <AdRandomWidth />
      <Paper className="p-2 bg-white dark:bg-zinc-800">
        <h2 className="text-xl">獲得ポイント</h2>
        <table className="w-full table-auto">
          <tr>
            <th>総合評価ポイント</th>
            <th>日間</th>
            <th>週間</th>
            <th>月間</th>
            <th>四半期</th>
            <th>年間</th>
            <th>週間UU</th>
          </tr>
          <tbody>
            <tr>
              <td className="text-center">
                {item.global_point.toLocaleString()}
              </td>
              <td className="text-center">
                {item.daily_point.toLocaleString()}
              </td>
              <td className="text-center">
                {item.weekly_point.toLocaleString()}
              </td>
              <td className="text-center">
                {item.monthly_point.toLocaleString()}
              </td>
              <td className="text-center">
                {item.quarter_point.toLocaleString()}
              </td>
              <td className="text-center">
                {item.yearly_point.toLocaleString()}
              </td>
              <td className="text-center">
                {item.weekly_unique.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </Paper>
      <p className="box-border my-4">
        <Button as="a" href={detail} target="_blank" rel="noopener noreferrer">
          小説情報
        </Button>{" "}
        <Button as="a" href={link} target="_blank" rel="noopener noreferrer">
          読む
        </Button>{" "}
        <TwitterShare title={`${item.title}のランキング履歴`}>
          ランキング履歴を共有
        </TwitterShare>
      </p>
      <AdSense></AdSense>
    </>
  );
};

export default DetailItem;
