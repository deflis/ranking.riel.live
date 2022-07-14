import { NarouRankingResult } from "narou/src/index.browser";
import React from "react";
import { Tag, Tags } from "../common/bulma/Tag";

const FakeItem: React.FC<{
  rankingItem?: NarouRankingResult | undefined;
}> = ({ rankingItem }) => {
  return (
    <div className="p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 ">
      <p color="textSecondary">
        {rankingItem && (
          <>
            第{rankingItem.rank}位{" "}
            <Tags>
              <Tag>{rankingItem.pt?.toLocaleString()}pt</Tag>
            </Tags>
          </>
        )}
      </p>
      <h2 className="mb-2 text-2xl text-gray-800 dark:text-white animate-pulse">
        <span className="h-4 bg-gray-200 rounded w-full" />
      </h2>
      <p color="textSecondary">作者: </p>
      <p color="textSecondary">更新日時: </p>
      <p color="textSecondary">掲載開始: 前 / 最終更新: 前</p>
      <div className="p-2 rounded border"></div>
      <div>
        <button>あらすじを表示</button>
        <span>小説情報</span>
        <span>読む</span>
      </div>
    </div>
  );
};

export default FakeItem;
