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
import {
  Detail,
  Item,
  ItemDetail,
  NocDetail,
  NocItem,
  NocItemDetail,
} from "../../../modules/data/types";
import { Chip } from "../atoms/Chip";
import { Paper } from "../atoms/Paper";
import { Button } from "../atoms/Button";
import { Link as RouterLink } from "react-router-dom";
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
import { PulseLoader } from "../atoms/Loader";

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

function checkR18(
  isR18: boolean,
  item: Item | NocItem | undefined
): item is NocItem {
  return (
    isR18 && (item === undefined || (item as NocItem)?.nocgenre !== undefined)
  );
}

const DetailItem: React.FC<{
  ncode: string;
  item: Item | NocItem | undefined;
  detail: Detail | NocDetail | undefined;
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
  const user = `https://mypage.syosetu.com/${item?.userid}/`;
  const link = `${baseUrl}/${ncode}/`;
  const linkFirst = `${baseUrl}/${ncode}/1/`;
  const linkLast = `${baseUrl}/${ncode}/${item?.general_all_no}/`;

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
            {ncode.toUpperCase()}
          </Tag>{" "}
          {item ? (
            !isR18 ? (
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
            )
          ) : (
            <PulseLoader className="w-1/4" disabled={isNotFound} />
          )}
        </p>
        <h1 className="text-4xl">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="link-reset hover:underline"
          >
            {item ? (
              decode(item.title)
            ) : isNotFound ? (
              "小説が見つかりません。削除された可能性があります。"
            ) : (
              <PulseLoader className="h-8" />
            )}
          </a>
        </h1>
        <p className="text-sm">
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
          {item && (
            <Tag>
              {Math.round(item.length / item.general_all_no).toLocaleString()}
              文字/話
            </Tag>
          )}
        </p>
      </div>
      {/*<FirstAd />*/}
      <div className="flex space-x-2 flex-col md:flex-row">
        <div className="w-full md:w-1/2 xl:w-7/12">
          <h2 className="text-xl">あらすじ</h2>
          {item ? (
            <StoryRender
              story={item.story}
              className="bg-white p-2 md:max-h-screen overflow-auto dark:bg-zinc-800"
            />
          ) : (
            <div className="bg-white p-2 md:max-h-screen overflow-auto dark:bg-zinc-800">
              <PulseLoader disabled={isNotFound} />
            </div>
          )}
        </div>
        <div className="w-full md:w-1/2 xl:w-5/12 shrink-0 m-0 p-2 text-sm space-y-2">
          <DetailItemText
            label="作者"
            icon={<FaPenNib className="w-3 h-3 inline" />}
          >
            {item ? (
              isR18 ? (
                decode(item.writer)
              ) : (
                <a href={user} target="_blank" rel="noopener noreferrer">
                  {decode(item.writer)}
                </a>
              )
            ) : (
              <PulseLoader className="w-1/2" disabled={isNotFound} />
            )}
          </DetailItemText>
          {!isR18 && (
            <DetailItemText
              label="ジャンル"
              icon={<HiGlobeAlt className="w-3 h-3 inline" />}
            >
              {item ? (
                <RouterLink to={`/custom?genres=${item.genre}`}>
                  {GenreNotation[item.genre]}
                </RouterLink>
              ) : (
                <PulseLoader className="w-1/2" disabled={isNotFound} />
              )}
            </DetailItemText>
          )}
          {isR18 && (
            <DetailItemText label="サイト">
              {item ? (
                <RouterLink to={`/r18?genres=${item.nocgenre}`}>
                  {R18SiteNotation[item.nocgenre]}
                </RouterLink>
              ) : (
                <PulseLoader className="w-1/2" disabled={isNotFound} />
              )}
            </DetailItemText>
          )}
          <DetailItemText label="キーワード">
            {item ? (
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
            ) : (
              <PulseLoader disabled={isNotFound} />
            )}
          </DetailItemText>
          <DetailItemText
            label="掲載日"
            icon={<HiCalendar className="w-3 h-3 inline" />}
          >
            {item ? (
              <>
                {item.general_firstup.toFormat(dateFormat)} （
                {item.general_firstup.toRelative()}）
              </>
            ) : (
              <PulseLoader disabled={isNotFound} />
            )}
          </DetailItemText>
          <DetailItemText
            label="最新部分掲載日"
            icon={<IoTime className="w-3 h-3 inline" />}
          >
            {item ? (
              <>
                {item.general_lastup.toFormat(dateFormat)} （
                {item.general_lastup.toRelative()}）
              </>
            ) : (
              <PulseLoader disabled={isNotFound} />
            )}
          </DetailItemText>
          <DetailItemText
            label="感想"
            icon={<HiChatAlt className="w-3 h-3 inline" />}
          >
            {detailItem ? (
              <>{detailItem.impression_cnt.toLocaleString()}件</>
            ) : (
              <PulseLoader disabled={isNotFound} />
            )}
          </DetailItemText>
          <DetailItemText
            label="レビュー"
            icon={<HiPencilAlt className="w-3 h-3 inline" />}
          >
            {detailItem ? (
              <>{detailItem.review_cnt.toLocaleString()}件</>
            ) : (
              <PulseLoader disabled={isNotFound} />
            )}
          </DetailItemText>
          <DetailItemText
            label="ブックマーク登録"
            icon={<HiBookmark className="w-3 h-3 inline" />}
          >
            {detailItem ? (
              <>{detailItem.fav_novel_cnt.toLocaleString()}件</>
            ) : (
              <PulseLoader disabled={isNotFound} />
            )}
          </DetailItemText>
          <DetailItemText
            label="総合評価"
            icon={<HiThumbUp className="w-3 h-3 inline" />}
          >
            {detailItem ? (
              <>
                {detailItem.all_point.toLocaleString()}pt /{" "}
                {detailItem.all_hyoka_cnt.toLocaleString()}人 = 平均
                {round(
                  detailItem.all_point / detailItem.all_hyoka_cnt,
                  2
                ).toLocaleString()}
                pt
              </>
            ) : (
              <PulseLoader disabled={isNotFound} />
            )}
          </DetailItemText>
          <DetailItemText
            label="文字数"
            icon={<IoLanguage className="w-3 h-3 inline" />}
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
                {detailItem?.global_point.toLocaleString() ?? (
                  <PulseLoader disabled={isNotFound} />
                )}
              </td>
              <td className="text-center">
                {detailItem?.daily_point.toLocaleString() ?? (
                  <PulseLoader disabled={isNotFound} />
                )}
              </td>
              <td className="text-center">
                {detailItem?.weekly_point.toLocaleString() ?? (
                  <PulseLoader disabled={isNotFound} />
                )}
              </td>
              <td className="text-center">
                {detailItem?.monthly_point.toLocaleString() ?? (
                  <PulseLoader disabled={isNotFound} />
                )}
              </td>
              <td className="text-center">
                {detailItem?.quarter_point.toLocaleString() ?? (
                  <PulseLoader disabled={isNotFound} />
                )}
              </td>
              <td className="text-center">
                {detailItem?.yearly_point.toLocaleString() ?? (
                  <PulseLoader disabled={isNotFound} />
                )}
              </td>
              <td className="text-center">
                {detailItem?.weekly_unique.toLocaleString() ?? (
                  <PulseLoader disabled={isNotFound} />
                )}
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
        <TwitterShare title={`${item?.title}のランキング履歴`}>
          ランキング履歴を共有
        </TwitterShare>
      </p>
      <AdSense></AdSense>
    </>
  );
};

export default DetailItem;
