import React from "react";
import { NarouSearchResult } from "narou";
import { AllHtmlEntities } from "html-entities";
import Genre from "../../enum/Genre";
import { parse, formatDistance } from "date-fns";
import { ja } from "date-fns/locale";

const entities = new AllHtmlEntities();
const baseDate = new Date();
const formatOptions = { locale: ja };
const narouDateFormat = "yyyy-MM-dd HH:mm:ss";

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
    .map(word => (
      <a
        className="tag"
        href={`https://yomou.syosetu.com/search.php?word=${word}`}
      >
        {word}
      </a>
    ))
    .reduce((previus, current) => (
      <>
        {previus} {current}
      </>
    ));
  const story = item.story.split(/\n/).reduce(
    (x, y) => (
      <>
        {x}
        <br />
        {y}
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
                  全{item.general_all_no}話
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
              {Math.round(item.length / item.general_all_no)}文字/話
            </span>
          </div>
        </div>
        <div>
          <article className="message">
            <div className="message-header">
              <p>あらすじ</p>
            </div>
            <div className="message-body">
              <p>{story}</p>{" "}
            </div>
          </article>
          <p>{keywords}</p>
          <table className="table is-bordered is-fullwidth">
            <tbody>
              <tr>
                <th>作者</th>
                <td>
                  <a href={user} target="_blank" rel="noopener noreferrer">
                    {entities.decode(item.writer)}
                  </a>
                </td>
              </tr>
              <tr>
                <th>ジャンル</th>
                <td>
                  <a href={ranking} target="_blank" rel="noopener noreferrer">
                    {Genre.get(item.genre)}
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="content">
          <p>掲載日 {item.general_firstup}</p>
          <p>最新部分掲載日 {item.general_lastup}</p>
          <p>感想 {item.impression_cnt}件</p>
          <p>レビュー {item.review_cnt}件</p>
          <p>ブックマーク登録 {item.fav_novel_cnt}件</p>
          <p>総合評価 {item.all_point}pt</p>
          <p>文字数 {item.length}文字</p>
          <p>更新日時: {item.novelupdated_at}</p>
          <p>
            掲載開始:{" "}
            {formatDistance(
              parse(item.general_firstup, narouDateFormat, new Date()),
              baseDate,
              formatOptions
            )}
            前 / 最終更新:{" "}
            {formatDistance(
              parse(item.general_lastup, narouDateFormat, new Date()),
              baseDate,
              formatOptions
            )}
            前
          </p>
        </div>
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
          </a>
        </p>
      </div>
    </div>
  );
};

export default DetailItem;
