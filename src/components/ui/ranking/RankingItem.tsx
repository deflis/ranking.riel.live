import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { decode } from "html-entities";
import { useAtomValue } from "jotai";
import { GenreNotation, R18SiteNotation } from "narou/browser";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useToggle } from "react-use";

import { Button } from "../atoms/Button";
import { Chip } from "../atoms/Chip";
import { PulseLoader } from "../atoms/Loader";
import { Paper } from "../atoms/Paper";
import ItemBadge from "../common/badges/ItemBadge";
import { Tag, Tags } from "../common/bulma/Tag";
import { showKeywordAtom, titleHeightAtom } from "@/modules/atoms/global";
import { useItemForListing } from "@/modules/data/item";
import { useR18ItemForListing } from "@/modules/data/r18item";
import { Item, NocItem } from "@/modules/data/types";
import { RankingResultItem } from "@/modules/interfaces/RankingResultItem";

function checkR18(
  isR18: boolean,
  item: Item | NocItem | undefined
): item is NocItem {
  return (
    isR18 && (item === undefined || (item as NocItem)?.nocgenre !== undefined)
  );
}
const RankingItemRender: React.FC<{
  className?: string;
  ncode: string;
  rankingItem: RankingResultItem;
  item: Item | NocItem | undefined;
  isR18?: true;
  isLoading: boolean;
  isError: boolean;
}> = ({
  className,
  ncode,
  rankingItem,
  item,
  isError,
  isLoading,
  isR18: rawR18 = false,
}) => {
  const titleHeight = useAtomValue(titleHeightAtom);
  const showKeyword = useAtomValue(showKeywordAtom);

  const [openStory, toggleStory] = useToggle(false);

  const isR18 = checkR18(rawR18, item);
  const isNotfound = (!item && !isLoading) || isError;

  const user = `https://mypage.syosetu.com/${item?.userid}/`;
  const link = isR18
    ? `https://novel18.syosetu.com/${(item?.ncode ?? ncode)?.toLowerCase()}/`
    : `https://ncode.syosetu.com/${(item?.ncode ?? ncode)?.toLowerCase()}/`;
  const detail = isR18
    ? `/r18/detail/${(item?.ncode ?? ncode)?.toLowerCase()}`
    : `/detail/${(item?.ncode ?? ncode)?.toLowerCase()}`;

  return (
    <div
      className={clsx(
        className,
        "box-border grid grid-rows-subgrid gap-2",
        "row-span-8",
        "p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700"
      )}
    >
      <p>
        第{rankingItem.rank}位{" "}
        <Tags>
          <Tag>{rankingItem.pt?.toLocaleString()}pt</Tag>
          {item?.general_firstup &&
            item.general_firstup.diffNow().as("month") <= 1 && (
              <Tag
                tagColor="red"
                light={item.general_firstup.diffNow().as("day") <= 7}
              >
                New!
              </Tag>
            )}
        </Tags>
      </p>
      <p>
        {item ? (
          <>
            <ItemBadge item={item} />
            {!isR18 && (
              <RouterLink to={`/custom?genres=${item.genre}`}>
                {GenreNotation[item.genre]}
              </RouterLink>
            )}
            {isR18 && (
              <RouterLink to={`/r18?sites=${item.nocgenre}`}>
                {R18SiteNotation[item.nocgenre]}
              </RouterLink>
            )}
            <Tag>
              {Math.round(item.length / item.general_all_no).toLocaleString()}
              文字/話
            </Tag>
          </>
        ) : (
          <PulseLoader disabled={isNotfound} />
        )}
      </p>
      <h2 className="mb-2 text-2xl">
        <RouterLink
          to={detail}
          title={decode(item?.title)}
          className={clsx(
            "link-reset text-gray-800 dark:text-white hover:underline",
            titleHeight > 0 && `line-clamp-${titleHeight} overflow-ellipsis`
          )}
        >
          {item ? (
            decode(item.title)
          ) : isNotfound ? (
            `この小説は見つかりません`
          ) : (
            <PulseLoader className="h-6" disabled={isNotfound} />
          )}
        </RouterLink>
      </h2>

      <p>
        作者:{" "}
        {item ? (
          isR18 ? (
            decode(item.writer)
          ) : (
            <a href={user} target="_blank" rel="noopener noreferrer">
              {decode(item.writer)}
            </a>
          )
        ) : (
          <PulseLoader className="w-1/4" disabled={isNotfound} />
        )}
      </p>
      <p>
        更新日時:{" "}
        {item?.novelupdated_at.toFormat("yyyy/MM/dd HH:mm:ss") ?? (
          <PulseLoader className="w-1/4 m-0" disabled={isNotfound} />
        )}
      </p>
      <p>
        掲載開始:{" "}
        {item?.general_firstup.toRelative() ?? (
          <PulseLoader className="w-1/4 m-0" disabled={isNotfound} />
        )}{" "}
        / 最終更新:{" "}
        {item?.general_lastup.toRelative() ?? (
          <PulseLoader className="w-1/4 m-0" disabled={isNotfound} />
        )}
      </p>
      <Paper
        className={clsx(
          "p-2 space-2 bg-gray-50 dark:bg-zinc-900",
          !showKeyword && "hidden"
        )}
      >
        {item?.keyword
          .split(/\s/g)
          .filter((keyword) => keyword)
          .map((keyword, i) => (
            <Chip
              as={RouterLink}
              key={i}
              to={
                isR18 ? `/r18?keyword=${keyword}` : `/custom?keyword=${keyword}`
              }
            >
              {keyword}
            </Chip>
          )) ?? <PulseLoader disabled={isNotfound} />}
      </Paper>

      <div className="space-y-2">
        {item && (
          <Transition
            show={openStory}
            enter="transition duration-100 origin-top ease-out"
            enterFrom="transform scale-75 scale-y-0 opacity-0 "
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 origin-top ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-75 opacity-0"
            as={Paper}
            className="bg-gray-100 p-2 whitespace-pre-wrap text-sm dark:bg-zinc-900 box-content"
          >
            {item.story}
          </Transition>
        )}
        <div className="flex space-x-2 items-center">
          {item && (
            <Button onClick={toggleStory}>
              あらすじを{openStory ? "隠す" : "表示"}
            </Button>
          )}
          <div className="flex-grow" />
          <RouterLink to={detail}>小説情報</RouterLink>
          <Button
            as="a"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            title={decode(item?.title)}
          >
            読む
          </Button>
        </div>
      </div>
    </div>
  );
};

export const RankingItem: React.FC<{
  item: RankingResultItem;
  className?: string;
}> = ({ item: rankingItem, className }) => {
  const { data: item, isLoading, error } = useItemForListing(rankingItem.ncode);
  return (
    <>
      <RankingItemRender
        className={className}
        ncode={rankingItem.ncode}
        item={item}
        rankingItem={rankingItem}
        isLoading={isLoading}
        isError={!!error}
      />
    </>
  );
};

export const R18RankingItem: React.FC<{
  item: RankingResultItem;
  className?: string;
}> = ({ item: rankingItem, className }) => {
  const {
    data: item,
    isLoading,
    error,
  } = useR18ItemForListing(rankingItem.ncode);
  return (
    <>
      <RankingItemRender
        className={className}
        isR18={true}
        ncode={rankingItem.ncode}
        item={item}
        rankingItem={rankingItem}
        isLoading={isLoading}
        isError={!!error}
      />
    </>
  );
};

export default RankingItem;
