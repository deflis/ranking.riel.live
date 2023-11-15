import { DateTime } from "luxon";
import { R18Site, R18SiteNotation } from "narou/browser";
import React, { useCallback, useEffect, useMemo } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { FaCog, FaSearch, FaTimes } from "react-icons/fa";
import { useToggle } from "react-use";

import {
  FilterConfig,
  TermStrings,
  parseDateRange,
} from "../../../modules/atoms/filter";
import { R18RankingParams } from "../../../modules/interfaces/CustomRankingParams";
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

export interface R18RankingFormParams {
  params: R18RankingParams;
  onSearch: (e: R18RankingParams) => void;
}

interface InnerParams {
  onClose: () => void;
}

export const R18RankingForm: React.FC<R18RankingFormParams> = ({
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
  params: R18RankingParams;
}> = React.memo(function DisableCustomRankingFormBase({
  params: { keyword, rankingType, sites },
}: {
  params: R18RankingParams;
}) {
  const genre =
    sites.length > 0
      ? sites
          .map((site) => <Tag key={site}>{R18SiteNotation[site]}</Tag>)
          .reduce(
            (previous, current) => (
              <>
                {previous} {current}
              </>
            ),
            <>サイト: </>
          )
      : "サイト設定なし";
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
  sites: {
    nocturne: boolean;
    moonLight: boolean;
    moonLightBL: boolean;
    midnight: boolean;
  };
} & Omit<FilterConfig, "genres">;

function getDefaultValues({
  rankingType,
  keyword,
  notKeyword,
  byTitle,
  byStory,
  sites,
  min,
  max,
  firstUpdate: firstUpdateRaw,
  kanketsu,
  rensai,
  tanpen,
}: R18RankingParams): CustomRankingConfig {
  const firstUpdate = parseDateRange(firstUpdateRaw);
  return {
    rankingType,
    keyword: keyword ?? "",
    notKeyword: notKeyword ?? "",
    byTitle,
    byStory,
    sites: {
      nocturne: sites.includes(R18Site.Nocturne),
      moonLight: sites.includes(R18Site.MoonLight),
      moonLightBL: sites.includes(R18Site.MoonLightBL),
      midnight: sites.includes(R18Site.Midnight),
    },
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
      begin: firstUpdate?.toISODate() ?? DateTime.now().toISODate() ?? "",
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
  sites: { nocturne, moonLight, moonLightBL, midnight },
  story,
  firstUpdate,
  status,
}: CustomRankingConfig): R18RankingParams {
  return {
    rankingType,
    keyword,
    notKeyword,
    byTitle,
    byStory,
    sites: [
      ...(nocturne ? [R18Site.Nocturne] : []),
      ...(moonLight ? [R18Site.MoonLight] : []),
      ...(moonLightBL ? [R18Site.MoonLightBL] : []),
      ...(midnight ? [R18Site.Midnight] : []),
    ],
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

const EnableCustomRankingForm: React.FC<R18RankingFormParams & InnerParams> = ({
  params,
  onSearch,
  onClose,
}) => {
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

  const selectAll = useCallback(() => {
    setValue("sites.nocturne", true);
    setValue("sites.moonLight", true);
    setValue("sites.moonLightBL", true);
    setValue("sites.midnight", true);
  }, []);
  const unselectAll = useCallback(() => {
    setValue("sites.nocturne", false);
    setValue("sites.moonLight", false);
    setValue("sites.moonLightBL", false);
    setValue("sites.midnight", false);
  }, []);

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
          <legend className="font-bold text-sm text-slate-500">サイト</legend>
          <label>
            <Checkbox {...register(`sites.nocturne`)} />
            {R18SiteNotation[R18Site.Nocturne]}
          </label>
          <label>
            <Checkbox {...register(`sites.moonLight`)} />
            {R18SiteNotation[R18Site.MoonLight]}
          </label>
          <label>
            <Checkbox {...register(`sites.moonLightBL`)} />
            {R18SiteNotation[R18Site.MoonLightBL]}
          </label>
          <label>
            <Checkbox {...register(`sites.midnight`)} />
            {R18SiteNotation[R18Site.Midnight]}
          </label>
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
            min={
              DateTime.fromObject({
                year: 2013,
                month: 5,
                day: 1,
              }).toISODate() ?? ""
            }
            max={DateTime.now().toISODate() ?? ""}
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
