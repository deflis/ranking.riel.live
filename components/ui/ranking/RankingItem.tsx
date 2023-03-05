import React from "react";
import {
  GenreNotation,
  NarouRankingResult,
  R18SiteNotation,
} from "narou/src/index.browser";
import { Tag, Tags } from "../common/bulma/Tag";
import { useCss, useToggle } from "react-use";
import ItemBadge from "../common/badges/ItemBadge";
import { Item, NocItem } from "../../../modules/data/types";
import { useItemForListing } from "../../../modules/data/item";
import { decode } from "html-entities";
import { Transition } from "@headlessui/react";
import { Paper } from "../atoms/Paper";
import { Link as RouterLink } from "react-router-dom";
import { Chip } from "../atoms/Chip";
import { useAtomValue } from "jotai";
import {
  showKeywordAtom,
  titleHeightAtom,
} from "../../../modules/atoms/global";
import clsx from "clsx";
import { Button } from "../atoms/Button";
import { RankingResultItem } from "../../../modules/interfaces/RankingResultItem";
import { PulseLoader } from "../atoms/PulseLoader";

function checkR18(item: Item | NocItem | undefined): item is NocItem {
  return !!item && (item as NocItem).nocgenre !== undefined;
}
const RankingItemRender: React.FC<{
  rankingItem: RankingResultItem;
  item: Item | NocItem | undefined;
  isLoading: boolean;
  isError: boolean;
}> = ({ rankingItem, item, isError, isLoading }) => {
  const titleHeight = useAtomValue(titleHeightAtom);
  const titleHeightCss = useCss({
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: titleHeight,
    lineClamp: titleHeight,
    overflow: "hidden",
    textOverflow: "ellipsis",
  });
  const showKeyword = useAtomValue(showKeywordAtom);

  const [openStory, toggleStory] = useToggle(false);

  const isR18 = checkR18(item);
  const isNotfound = (!item && !isLoading) || isError;

  const user = `https://mypage.syosetu.com/${item?.userid}/`;
  const link = isR18
    ? `https://novel18.syosetu.com/${item?.ncode?.toLowerCase()}/`
    : `https://ncode.syosetu.com/${item?.ncode?.toLowerCase()}/`;
  const detail = isR18
    ? `/r18/detail/${item?.ncode?.toLowerCase()}`
    : `/detail/${item?.ncode?.toLowerCase()}`;

  return (
    <div className="p-6 w-full bg-white rounded-lg border border-gray-200 shadow-md dark:bg-zinc-800 dark:border-zinc-700 space-y-2">
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
              <RouterLink to={`/r18?site=${item.nocgenre}`}>
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
        {item ? (
          <RouterLink
            to={detail}
            title={decode(item.title)}
            className={clsx(
              "link-reset text-gray-800 dark:text-white hover:underline",
              titleHeight > 0 && titleHeightCss
            )}
          >
            {decode(item.title)}
          </RouterLink>
        ) : isNotfound ? (
          `この小説は見つかりません`
        ) : (
          <PulseLoader className="h-6" disabled={isNotfound} />
        )}
      </h2>

      <>
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
                  isR18
                    ? `/r18?keyword=${keyword}`
                    : `/custom?keyword=${keyword}`
                }
              >
                {keyword}
              </Chip>
            )) ?? <PulseLoader disabled={isNotfound} />}
        </Paper>

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
            className="bg-gray-100 p-2 whitespace-pre-wrap text-sm dark:bg-zinc-900"
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
      </>
    </div>
  );
};

const RankingItem: React.FC<{ item: RankingResultItem }> = ({
  item: rankingItem,
}) => {
  const { data: item, isLoading, error } = useItemForListing(rankingItem.ncode);
  return (
    <>
      <RankingItemRender
        item={item}
        rankingItem={rankingItem}
        isLoading={isLoading}
        isError={!!error}
      />
    </>
  );
};

export default RankingItem;
