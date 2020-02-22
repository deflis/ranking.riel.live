import React, { useState, useCallback } from "react";
import { RankingResult } from "narou";
import { AllHtmlEntities } from "html-entities";
import Genre from "../../enum/Genre";
import { parse, formatDistance, isBefore, addDays, isAfter } from "date-fns";
import { ja } from "date-fns/locale";
import { addMonths } from "date-fns/esm";
import { Link } from "react-router-dom";

const entities = new AllHtmlEntities();
const baseDate = new Date();
const formatOptions = { locale: ja };
const narouDateFormat = "yyyy-MM-dd HH:mm:ss";

const RankingItem: React.FC<{ item: RankingResult }> = ({ item }) => {
  const [isShowStory, setShowStory] = useState(false);
  const toggleShowStory = useCallback(() => {
    setShowStory(!isShowStory);
  }, [isShowStory]);
  const user = `https://mypage.syosetu.com/${item.userid}/`;
  const link = `https://ncode.syosetu.com/${item.ncode.toLowerCase()}/`;
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
  return (
    <div className="card">
      <header className="card-header">
        <p className="card-header-title">
          第{item.rank}位
          <span
            className={`tag ${
              item.pt > 5000 ? "is-danger" : item.pt > 1000 ? "is-success" : ""
            } is-light`}
          >
            {item.pt}pt
          </span>
          {isBefore(
            parse(item.general_firstup, narouDateFormat, new Date()),
            addMonths(new Date(), -1)
          ) ? (
            ""
          ) : (
            <span
              className={`tag is-danger ${
                isAfter(
                  parse(item.general_firstup, narouDateFormat, new Date()),
                  addDays(new Date(), -7)
                )
                  ? ""
                  : "is-light"
              }`}
            >New!</span>
          )}
        </p>
      </header>
      <div className="card-content">
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
            <a
              className="tag"
              href={ranking}
              target="_blank"
              rel="noopener noreferrer"
            >
              {Genre.get(item.genre)}
            </a>
          </div>
          <div className="control">
            <span className="tag">
              {Math.round(item.length / item.general_all_no)}文字/話
            </span>
          </div>
        </div>
        <div className="content">
          <p>
            <a
              className="title is-5"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {entities.decode(item.title)}
            </a>
          </p>
          <p>
            作者:{" "}
            <a href={user} target="_blank" rel="noopener noreferrer">
              {entities.decode(item.writer)}
            </a>
          </p>
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
        <div className="content">
          <p>{keywords}</p>
        </div>
        {isShowStory ? (
          <div className="content">
            <p>{item.story}</p>
          </div>
        ) : (
          <></>
        )}
        <div className="card-footer">
          <p className="card-footer-item">
            <span className="button is-small" onClick={toggleShowStory}>
              あらすじを{isShowStory ? "隠す" : "表示"}
            </span>
          </p>
          <p className="card-footer-item">
            <Link
              className=""
              to={`/detail/${item.ncode.toLowerCase()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              小説情報
            </Link>
          </p>
          <p className="card-footer-item">
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
    </div>
  );
};

export default RankingItem;
