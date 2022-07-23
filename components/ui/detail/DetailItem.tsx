import React from "react";
import {
  NarouSearchResult,
  NovelType,
  R18SiteNotation,
  Genre,
  GenreNotation,
} from "narou/src/index.browser";
import { decode } from "html-entities";
import { formatDistance, format } from "date-fns";
import { ja } from "date-fns/locale";
import { TwitterShare } from "../common/TwitterShare";
import AdSense from "../common/AdSense";
import { Tag, Tags } from "../common/bulma/Tag";
import StoryRender from "../common/StoryRender";
import DetailItemText from "./DetailItemText";
import ItemBadge from "../common/badges/ItemBadge";
// import { FirstAd } from "../common/FirstAd";
import { AdRandomWidth } from "../common/AdRandom";
import { ItemDetail } from "../../../modules/data/types";
import { Chip } from "../atoms/Chip";
import { Paper } from "../atoms/Paper";
import { Button } from "../atoms/Button";
import { Link as RouterLink } from "@tanstack/react-location";

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

const DetailItem: React.FC<{ item: ItemDetail }> = ({ item }) => {
  const isR18 = false; //item.nocgenre !== undefined;
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
          <Tag as="a" href={link} target="_blank" rel="noopener noreferrer">
            {item.ncode}
          </Tag>{" "}
          <a href={`/custom?genres=${item.genre}`} rel="noopener noreferrer">
            {GenreNotation[item.genre]}
          </a>
        </p>
        <h1>
          <a
            color="textPrimary"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {decode(item.title)}
          </a>
        </h1>
        <h2>
          <ItemBadge item={item} />
          {item.noveltype === NovelType.Tanpen ? (
            <a href={link} target="_blank" rel="noopener noreferrer">
              読む
            </a>
          ) : (
            <>
              <a href={linkFirst} target="_blank" rel="noopener noreferrer">
                第1話を読む
              </a>{" "}
              |{" "}
              <a href={linkLast} target="_blank" rel="noopener noreferrer">
                最新話を読む
              </a>
            </>
          )}
          <Tag>
            {Math.round(item.length / item.general_all_no).toLocaleString()}
            文字/話
          </Tag>
        </h2>
      </div>
      {/*<FirstAd />*/}
      <div>
        <div>
          <h2>あらすじ</h2>
          <StoryRender story={item.story} />
        </div>
        <div>
          <DetailItemText label="作者">
            {isR18 ? (
              decode(item.writer)
            ) : (
              <a href={user} target="_blank" rel="noopener noreferrer">
                {decode(item.writer)}
              </a>
            )}
          </DetailItemText>
          {item.genre && (
            <DetailItemText label="ジャンル">
              <a href={`/custom?genres=${item.genre}`}>
                {GenreNotation[item.genre]}
              </a>
            </DetailItemText>
          )}
          {/*item.nocgenre && (
            <DetailItemText label="ジャンル">
              <Link component={RouterLink} to={`/r18?genres=${item.nocgenre}`}>
                {R18SiteNotation[item.nocgenre]}
              </Link>
            </DetailItemText>
          )*/}
          <DetailItemText label="キーワード">
            <Paper className="p-2 space-2 bg-gray-50 ">
              {item &&
                item.keyword
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
            </Paper>{" "}
          </DetailItemText>
          <DetailItemText label="掲載日">
            {item.general_firstup.toFormat(dateFormat)} （
            {item.general_firstup.toRelative()}前）
          </DetailItemText>
          <DetailItemText label="最新部分掲載日">
            {item.general_lastup.toFormat(dateFormat)} （
            {item.general_lastup.toRelative()}前）
          </DetailItemText>
          <DetailItemText label="感想">
            {item.impression_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText label="レビュー">
            {item.review_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText label="ブックマーク登録">
            {item.fav_novel_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText label="総合評価">
            {item.all_point.toLocaleString()}pt /{" "}
            {item.all_hyoka_cnt.toLocaleString()}人 = 平均
            {round(item.all_point / item.all_hyoka_cnt, 2).toLocaleString()}
            pt
          </DetailItemText>
          <DetailItemText label="文字数">
            {item.length.toLocaleString()}文字 / 全
            {item.general_all_no.toLocaleString()}話 ={" "}
            {Math.round(item.length / item.general_all_no).toLocaleString()}
            文字/話
          </DetailItemText>
          <DetailItemText label="更新日時">
            {item.novelupdated_at.toFormat(dateFormat)}
          </DetailItemText>
          {/*<Hidden lgDown>
            <AdSense></AdSense>
        </Hidden>*/}
        </div>
      </div>

      <AdRandomWidth />
      <Paper>
        <h2>獲得ポイント</h2>
        <table>
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
              <td>{item.global_point.toLocaleString()}</td>
              <td>{item.daily_point.toLocaleString()}</td>
              <td>{item.weekly_point.toLocaleString()}</td>
              <td>{item.monthly_point.toLocaleString()}</td>
              <td>{item.quarter_point.toLocaleString()}</td>
              <td>{item.yearly_point.toLocaleString()}</td>
              <td>{item.weekly_unique.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </Paper>
      <p>
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
