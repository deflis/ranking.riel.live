import React from "react";
import { NarouSearchResult } from "narou";
import { AllHtmlEntities } from "html-entities";
import Genre from "../../enum/Genre";
import { parse, formatDistance, format } from "date-fns";
import { ja } from "date-fns/locale";
import { Link } from "react-router-dom";
import { TwitterShare } from "../common/TwitterShare";

const entities = new AllHtmlEntities();
const baseDate = new Date();
const formatOptions = { locale: ja };
const narouDateFormat = "yyyy-MM-dd HH:mm:ss";

function formatRelative(date: string): string {
  return formatDistance(parse(date, narouDateFormat, baseDate), baseDate, {
    locale: ja
  });
}
function formatDate(date: string): string {
  return format(
    parse(date, narouDateFormat, baseDate),
    "yyyy年MM月dd日 hh:mm:ss",
    formatOptions
  );
}
function round(number: number, precision: number): number {
  const shift = function(
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

const DetailItem: React.FC<{ item: NarouSearchResult }> = ({ item }) => {
  const detail = `https://ncode.syosetu.com/novelview/infotop/ncode/${item.ncode.toLowerCase()}/`;
  const user = `https://mypage.syosetu.com/${item.userid}/`;
  const link = `https://ncode.syosetu.com/${item.ncode.toLowerCase()}/`;
  const linkFirst = `https://ncode.syosetu.com/${item.ncode.toLowerCase()}/1/`;
  const linkLast = `https://ncode.syosetu.com/${item.ncode.toLowerCase()}/${
    item.general_all_no
  }/`;
  const ranking = `https://yomou.syosetu.com/rank/genrelist/type/daily_${item.genre}/`;
  const keywords = item.keyword
    .split(/\s/g)
    .map(keyword => (
      <Link className="tag" to={`/custom?keyword=${keyword}`}>
        {keyword}
      </Link>
    ))
    .reduce((previus, current) => (
      <>
        {previus} {current}
      </>
    ));
  const story = item.story.split(/\n/).reduce(
    (previus, current) => (
      <>
        {previus}
        <br />
        {current}
      </>
    ),
    <></>
  );

  return (
    <div className="content">
      <p>
        <a
          className="tag"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {item.ncode}
        </a>{" "}
        <a
          className="tag"
          href={ranking}
          target="_blank"
          rel="noopener noreferrer"
        >
          {Genre.get(item.genre)}
        </a>
      </p>
      <h1>
        <a
          className="title"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          {entities.decode(item.title)}
        </a>
      </h1>
      <div>
        <div className="field is-grouped is-grouped-multiline">
          <div className="control">
            <div className="tags has-addons">
              <span
                className={`tag ${
                  item.novel_type === 2
                    ? "is-info"
                    : item.end === 1
                    ? "is-primary"
                    : "is-success"
                } is-light`}
              >
                {item.novel_type === 2
                  ? " 短編"
                  : item.end === 1
                  ? " 連載中"
                  : " 完結"}{" "}
              </span>
              {item.novel_type === 2 ? (
                ""
              ) : (
                <span
                  className={`tag ${
                    item.general_all_no < 30
                      ? "is-info"
                      : item.general_all_no > 100
                      ? "is-danger is-light"
                      : ""
                  }`}
                >
                  全{item.general_all_no.toLocaleString()}話
                </span>
              )}
            </div>
          </div>
          <div className="control">
            {item.novel_type === 2 ? (
              <a
                className=""
                href={link}
                target="_blank"
                rel="noopener noreferrer"
              >
                読む
              </a>
            ) : (
              <>
                <a
                  className=""
                  href={linkFirst}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  第1話を読む
                </a>{" "}
                |{" "}
                <a
                  className=""
                  href={linkLast}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  最新話を読む
                </a>
              </>
            )}
          </div>
          <div className="control">
            <span className="tag">
              {Math.round(item.length / item.general_all_no).toLocaleString()}
              文字/話
            </span>
          </div>
        </div>
        <div className="columns">
          <div className="column is-three-fifths-desktop">
            <article className="message">
              <div className="message-header">
                <p>あらすじ</p>
              </div>
              <div className="message-body">
                <p>{story}</p>
              </div>
            </article>
          </div>
          <div className="column">
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">作者</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    <a href={user} target="_blank" rel="noopener noreferrer">
                      {entities.decode(item.writer)}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">ジャンル</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    <a href={ranking} target="_blank" rel="noopener noreferrer">
                      {Genre.get(item.genre)}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">キーワード</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">{keywords}</p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">掲載日</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    {formatDate(item.general_firstup)} （
                    {formatRelative(item.general_firstup)}前）
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">最新部分掲載日</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    {formatDate(item.general_lastup)} （
                    {formatRelative(item.general_lastup)}前）
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">感想</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    {item.impression_cnt.toLocaleString()}件
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">レビュー</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    {item.review_cnt.toLocaleString()}件
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">ブックマーク登録</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    {item.fav_novel_cnt.toLocaleString()}件
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">総合評価</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    {item.all_point.toLocaleString()}pt /{" "}
                    {item.all_hyoka_cnt.toLocaleString()}人 = 平均
                    {round(
                      item.all_point / item.all_hyoka_cnt,
                      2
                    ).toLocaleString()}
                    pt
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">文字数</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    {item.length.toLocaleString()}文字 / 全
                    {item.general_all_no.toLocaleString()}話 ={" "}
                    {Math.round(
                      item.length / item.general_all_no
                    ).toLocaleString()}
                    文字/話
                  </p>
                </div>
              </div>
            </div>
            <div className="field is-horizontal">
              <div className="field-label">
                <label className="label">更新日時</label>
              </div>
              <div className="field-body">
                <div className="field">
                  <p className="control is-expanded">
                    {formatDate((item.novelupdated_at as any) as string)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content">
          <h3 className="subtitle">獲得ポイント</h3>
          <table className="table">
            <thead>
              <th>総合評価ポイント</th>
              <th>日間</th>
              <th>週間</th>
              <th>月間</th>
              <th>四半期</th>
              <th>年間</th>
            </thead>
            <tr>
              <td>{item.global_point.toLocaleString()}</td>
              <td>{item.daily_point.toLocaleString()}</td>
              <td>{item.weekly_point.toLocaleString()}</td>
              <td>{item.monthly_point.toLocaleString()}</td>
              <td>{item.quarter_point.toLocaleString()}</td>
              <td>{item.yearly_point.toLocaleString()}</td>
            </tr>
          </table>
          <p>
            <a
              className="button"
              href={detail}
              target="_blank"
              rel="noopener noreferrer"
            >
              小説情報
            </a>{" "}
            <a
              className="button"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              読む
            </a>{" "}
            <TwitterShare title={`${item.title}のランキング履歴`}>ランキング履歴を共有</TwitterShare>
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailItem;
