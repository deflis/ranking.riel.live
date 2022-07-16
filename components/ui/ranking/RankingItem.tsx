import React from "react";
import { GenreNotation, NarouRankingResult } from "narou/src/index.browser";
import { Tag, Tags } from "../common/bulma/Tag";
import { useToggle } from "react-use";
import ItemBadge from "../common/badges/ItemBadge";
import { useItemForListing } from "../../../modules/data/queries/item";
import { parse } from "../../../modules/utils/NarouDateFormat";
import { decode } from "html-entities";
import { Transition } from "@headlessui/react";
import { Paper } from "../atoms/Paper";
import { Link as RouterLink } from "@tanstack/react-location";
import { ItemResult } from "../../../modules/data/loaders/items";

const RankingItemRender: React.FC<{
  rankingItem: NarouRankingResult;
  item: ItemResult | undefined;
  isError?: boolean;
}> = ({ rankingItem, item }) => {
  const [openStory, toggleStory] = useToggle(false);

  const isR18 = false; //item?.nocgenre !== undefined;

  const user = `https://mypage.syosetu.com/${item?.userid}/`;
  const link = isR18
    ? `https://novel18.syosetu.com/${item?.ncode?.toLowerCase()}/`
    : `https://ncode.syosetu.com/${item?.ncode?.toLowerCase()}/`;
  const detail = isR18
    ? `/r18/detail/${item?.ncode?.toLowerCase()}`
    : `/detail/${item?.ncode?.toLowerCase()}`;
  const firstup = parse(item?.general_firstup);

  return (
    <div className="p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 space-y-2">
      <p color="textSecondary">
        第{rankingItem.rank}位{" "}
        <Tags>
          <Tag>{rankingItem.pt?.toLocaleString()}pt</Tag>
          {firstup && firstup.diffNow().as("month") <= 1 && (
            <Tag tagColor="red" light={firstup.diffNow().as("day") <= 7}>
              New!
            </Tag>
          )}
        </Tags>
      </p>
      <p>
        {item && (
          <>
            <ItemBadge item={item} />
            {!isR18 && (
              <RouterLink to={`/custom?genres=${item.genre}`}>
                {GenreNotation[item.genre]}
              </RouterLink>
            )}
            {
              isR18 && null
              //              <RouterLink to={`/r18?site=${item.nocgenre}`}>
              //                {R18SiteNotation[item.nocgenre]}
              //              </RouterLink>
            }
            <Tag>
              {Math.round(item.length / item.general_all_no).toLocaleString()}
              文字/話
            </Tag>
          </>
        )}
      </p>
      <h2 className="mb-2 text-2xl text-gray-800 dark:text-white">
        <RouterLink to={detail} title={decode(item?.title ?? "")}>
          {decode(item?.title)}
        </RouterLink>
      </h2>
      <p color="textSecondary">
        作者:{" "}
        {isR18 ? (
          decode(item?.writer)
        ) : (
          <a href={user} target="_blank" rel="noopener noreferrer">
            {decode(item?.writer)}
          </a>
        )}
      </p>
      <p color="textSecondary">更新日時: {item?.novelupdated_at}</p>
      <p color="textSecondary">
        {item && (
          <>
            掲載開始: {parse(item.general_firstup)?.toRelative()} / 最終更新:{" "}
            {parse(item.general_lastup)?.toRelative()}
          </>
        )}
      </p>
      <Paper className="p-2 space-2 bg-gray-50 ">
        {item &&
          item.keyword
            .split(/\s/g)
            .filter((keyword) => keyword)
            .map((keyword, i) => (
              <RouterLink
                key={i}
                to={
                  isR18
                    ? `/r18?keyword=${keyword}`
                    : `/custom?keyword=${keyword}`
                }
              >
                <a className="box-border rounded-full bg-gray-200 inline-flex text-sm h-8 justify-center align-middle items-center">
                  <span className="px-2">{keyword}</span>
                </a>
              </RouterLink>
            ))}
      </Paper>

      <Transition
        show={openStory}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-75 opacity-0 "
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-75 opacity-0"
        as={Paper}
        className="bg-gray-100 p-2 whitespace-pre-wrap text-sm"
      >
        {item?.story}
      </Transition>
      <div>
        <button onClick={toggleStory}>
          あらすじを{openStory ? "隠す" : "表示"}
        </button>
        <RouterLink to={detail}>小説情報</RouterLink>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          title={decode(item?.title)}
        >
          読む
        </a>
      </div>
    </div>
  );
};

const RankingItem: React.FC<{ item: NarouRankingResult }> = ({
  item: rankingItem,
}) => {
  const { data: item, isLoading, error } = useItemForListing(rankingItem.ncode);
  return (
    <>
      {isLoading && (
        <RankingItemRender item={undefined} rankingItem={rankingItem} />
      )}
      {item && <RankingItemRender item={item} rankingItem={rankingItem} />}
      {error && (
        <RankingItemRender item={undefined} rankingItem={rankingItem} isError />
      )}
    </>
  );
};

export default RankingItem;
