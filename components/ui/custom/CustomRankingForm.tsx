import { DateTime } from "luxon";
import { GenreNotation } from "narou/src/index.browser";
import React, { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FaCog, FaSearch, FaTimes } from "react-icons/fa";
import { useToggle } from "react-use";
import {
  FilterConfig,
  parseDateRange,
  TermStrings,
} from "../../../modules/atoms/filter";

import { allGenres } from "../../../modules/enum/Genre";
import { CustomRankingParams } from "../../../modules/interfaces/CustomRankingParams";
import {
  RankingType,
  RankingTypeName,
} from "../../../modules/interfaces/RankingType";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Paper } from "../atoms/Paper";
import { SelectBox } from "../atoms/SelectBox";
import { TextField } from "../atoms/TextField";
import { Tag } from "../common/bulma/Tag";

export interface CustomRankingFormParams {
  params: CustomRankingParams;
  onSearch: (e: CustomRankingParams) => void;
}

interface InnerParams {
  onClose: () => void;
}

export const CustomRankingForm: React.FC<CustomRankingFormParams> = ({
  params,
  onSearch,
}) => {
  const [show, toggleShow] = useToggle(false);

  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-row space-y-4">
        <div className="flex-grow" />
        <Button onClick={toggleShow}>
          <FaCog className="w-5 h-5 pr-2 inline" />
          編集
        </Button>
      </div>
      {show ? (
        <EnableCustomRankingForm
          params={params}
          onSearch={onSearch}
          onClose={toggleShow}
        />
      ) : (
        <DisableCustomRankingForm params={params} />
      )}
    </div>
  );
};

const DisableCustomRankingForm: React.FC<{
  params: CustomRankingParams;
}> = React.memo(({ params: { keyword, rankingType, genres } }) => {
  const genre =
    genres.length > 0
      ? genres
          .map((genre) => <Tag>{GenreNotation[genre]}</Tag>)
          .reduce(
            (previous, current) => (
              <>
                {previous} {current}
              </>
            ),
            <>ジャンル: </>
          )
      : "ジャンル設定なし";
  return (
    <>
      <h1 className="text-4xl md:text-6xl my-8">
        {keyword ? `${keyword}の` : "カスタム"}
        {RankingTypeName[rankingType]}ランキング
      </h1>
      <h2>{genre}</h2>
    </>
  );
});

const rankingTypeList = [
  RankingType.Daily,
  RankingType.Weekly,
  RankingType.Monthly,
  RankingType.Quarter,
  RankingType.Yearly,
  RankingType.All,
  RankingType.UniqueUser,
] as const;

type CustomRankingConfig = {
  rankingType: RankingType;
  keyword: string;
  notKeyword: string;
  byTitle: boolean;
  byStory: boolean;
} & FilterConfig;

function getDefaultValues({
  rankingType,
  keyword,
  notKeyword,
  byTitle,
  byStory,
  genres,
  min,
  max,
  firstUpdate: firstUpdateRaw,
  kanketsu,
  rensai,
  tanpen,
}: CustomRankingParams): CustomRankingConfig {
  const firstUpdate = parseDateRange(firstUpdateRaw);
  return {
    rankingType,
    keyword: keyword ?? "",
    notKeyword: notKeyword ?? "",
    byTitle,
    byStory,
    genres: allGenres.reduce(
      (accumulator, id) => ({
        ...accumulator,
        [`g${id}`]: genres.includes(id),
      }),
      {} as Record<`g${(typeof allGenres)[number]}`, boolean>
    ),
    story: {
      min: {
        enable: !!min,
        value: min ?? 1,
      },
      max: {
        enable: !!max,
        value: max ?? 1,
      },
    },
    firstUpdate: {
      term: DateTime.fromISO(firstUpdateRaw ?? "").isValid
        ? "custom"
        : (firstUpdateRaw as TermStrings) ?? "none",
      begin: firstUpdate?.toISODate() ?? DateTime.now().toISODate(),
      end: "",
    },
    status: {
      kanketsu,
      rensai,
      tanpen,
    },
  };
}

function convertToParams({
  rankingType,
  keyword,
  notKeyword,
  byTitle,
  byStory,
  genres,
  story,
  firstUpdate,
  status,
}: CustomRankingConfig): CustomRankingParams {
  return {
    rankingType,
    keyword,
    notKeyword,
    byTitle,
    byStory,
    genres: allGenres.filter((id) => genres[`g${id}`]),
    min: story.min.enable ? story.min.value : undefined,
    max: story.max.enable ? story.max.value : undefined,
    firstUpdate:
      firstUpdate.term === "custom"
        ? firstUpdate.begin
        : firstUpdate.term !== "none"
        ? firstUpdate.term
        : undefined,
    ...status,
  };
}

const EnableCustomRankingForm: React.FC<
  CustomRankingFormParams & InnerParams
> = ({ params, onSearch, onClose }) => {
  const defaultValues = useMemo(() => getDefaultValues(params), [params]);
  const { control, register, handleSubmit, setValue, reset } = useForm({
    mode: "onSubmit",
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const handleSearch = useCallback(
    (config: CustomRankingConfig) => {
      onSearch(convertToParams(config));
    },
    [onSearch]
  );

  const selectAll = useCallback(
    () => allGenres.forEach((id) => setValue(`genres.g${id}`, true)),
    [setValue]
  );
  const unselectAll = useCallback(
    () => allGenres.forEach((id) => setValue(`genres.g${id}`, false)),
    [setValue]
  );

  return (
    <form onSubmit={handleSubmit(handleSearch)}>
      <Paper className="bg-white p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
        <fieldset>
          <label className="inline-flex flex-col">
            <span className="font-bold text-sm text-slate-500">種類</span>
            <Controller
              name="rankingType"
              control={control}
              render={({ field: { onChange, value } }) => (
                <SelectBox
                  value={value}
                  onChange={onChange}
                  options={rankingTypeList.map((value) => ({
                    value,
                    label: RankingTypeName[value],
                  }))}
                  buttonClassName="w-52"
                />
              )}
            />
          </label>
        </fieldset>
        <fieldset className="space-x-2 flex items-end">
          <label className="inline-flex flex-col">
            <span className="font-bold text-sm text-slate-500">キーワード</span>
            <TextField {...register("keyword")} className="align-middle" />
          </label>
          <label className="inline-flex flex-col">
            <span className="font-bold text-sm  text-slate-500">
              除外キーワード
            </span>
            <TextField {...register("notKeyword")} className="align-middle" />
          </label>

          <label>
            <Checkbox {...register("byTitle")} className="align-middle" />
            <span className="align-middle">タイトルを含める</span>
          </label>
          <label>
            <Checkbox {...register("byStory")} className="align-middle" />
            <span className="align-middle">あらすじを含める</span>
          </label>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-sm text-slate-500">ジャンル</legend>
          {allGenres.map((id) => (
            <label key={id}>
              <Checkbox {...register(`genres.g${id}`)} />
              {GenreNotation[id]}
            </label>
          ))}
          <Button onClick={selectAll}>全選択</Button>
          <Button onClick={unselectAll}>全解除</Button>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-sm text-slate-500">話数</legend>
          <label>
            <Checkbox {...register("story.min.enable")} />
            最小
            <TextField
              type="number"
              min="1"
              {...register("story.min.value", { valueAsNumber: true })}
              disabled={!useWatch({ control, name: "story.min.enable" })}
            />
          </label>
          ～
          <label>
            <Checkbox {...register("story.max.enable")} />
            最大
            <TextField
              type="number"
              min="1"
              {...register("story.max.value", { valueAsNumber: true })}
              disabled={!useWatch({ control, name: "story.max.enable" })}
            />
          </label>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-sm text-slate-500">
            更新開始日
          </legend>
          <Controller
            name="firstUpdate.term"
            control={control}
            render={({ field: { onChange, value } }) => (
              <SelectBox
                value={value}
                onChange={onChange}
                options={[
                  { value: "none", label: "指定しない" },
                  { value: "1days", label: "1日より新しい" },
                  { value: "7days", label: "1週間より新しい" },
                  { value: "1months", label: "1ヶ月より新しい" },
                  { value: "6months", label: "半年より新しい" },
                  { value: "1years", label: "1年より新しい" },
                  { value: "custom", label: "選択する" },
                ]}
                buttonClassName="w-52"
              />
            )}
          />
          <TextField
            type="date"
            {...register("firstUpdate.begin")}
            min={DateTime.fromObject({
              year: 2013,
              month: 5,
              day: 1,
            }).toISODate()}
            max={DateTime.now().toISODate()}
            disabled={
              useWatch({ control, name: "firstUpdate.term" }) !== "custom"
            }
          />
        </fieldset>
        <fieldset>
          <legend className="font-bold text-sm text-slate-500">更新状態</legend>
          <label>
            <Checkbox {...register("status.rensai")} />
            連載中
          </label>
          <label>
            <Checkbox {...register("status.kanketsu")} />
            完結
          </label>
          <label>
            <Checkbox {...register("status.tanpen")} />
            短編
          </label>
        </fieldset>
        <fieldset className="space-x-4">
          <Button type="submit" color="primary" className="font-bold">
            <FaSearch className="w-5 h-5 pr-2 inline" />
            検索
          </Button>
          <Button onClick={onClose} className="font-bold">
            <FaTimes className="w-5 h-5 pr-2 inline" />
            閉じる
          </Button>
        </fieldset>
      </Paper>
    </form>
  );
};
