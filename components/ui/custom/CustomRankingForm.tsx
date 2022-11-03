import { DateTime } from "luxon";
import { Genre, GenreNotation } from "narou/src/index.browser";
import React, { useCallback, useEffect } from "react";
import { Controller, useController, useForm } from "react-hook-form";
import { FaCog, FaSearch, FaTimes } from "react-icons/fa";
import { useToggle } from "react-use";

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
import { StoryCount } from "../common/StoryCount";
import { TwitterShare } from "../common/TwitterShare";
import { FirstUpdateDatePicker } from "./FirstUpdateDatePicker";

export interface CustomRankingFormParams {
  params: CustomRankingParams;
  onSearch: (e: CustomRankingParams) => void;
}

interface InnterParams {
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
        <TwitterShare
          title={`${params.keyword ? `${params.keyword}の` : "カスタム"}${
            RankingTypeName[params.rankingType]
          }ランキング`}
        >
          ランキングを共有
        </TwitterShare>{" "}
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

type InnerParams = Omit<CustomRankingParams, "firstUpdate"> & {
  firstUpdate: string | undefined;
};

const EnableCustomRankingForm: React.FC<
  CustomRankingFormParams & InnterParams
> = ({ params, onSearch, onClose }) => {
  const { firstUpdate, ...otherParams } = params;
  const { control, register, handleSubmit, reset } = useForm<InnerParams>({
    mode: "onSubmit",
    defaultValues: { firstUpdate: firstUpdate?.toISODate(), ...otherParams },
  });
  useEffect(() => {
    const { firstUpdate, ...otherParams } = params;
    reset({ firstUpdate: firstUpdate?.toISODate(), ...otherParams });
  }, [params]);
  const handleSearch = useCallback(
    ({ firstUpdate, ...params }: InnerParams) => {
      onSearch({
        firstUpdate: firstUpdate ? DateTime.fromISO(firstUpdate) : undefined,
        ...params,
      });
    },
    [onSearch]
  );
  const {
    field: { value: genres, onChange: setGenres },
  } = useController({ name: "genres", control });

  const handleChangeGenre = useCallback(
    (e: React.ChangeEvent<{ value?: string }>) => {
      if (!e.target.value) return;
      const id = parseInt(e.target.value) as Genre;
      if (genres.includes(id)) {
        setGenres(genres.filter((x) => x !== id));
        return;
      } else {
        setGenres([id].concat(genres).sort());
      }
    },
    [genres]
  );

  const genreFilter = allGenres.map((id) => (
    <React.Fragment key={id}>
      <label className="inline-block">
        <Checkbox
          checked={genres.includes(id)}
          value={id}
          onChange={handleChangeGenre}
        />
        {GenreNotation[id]}
      </label>
    </React.Fragment>
  ));

  const selectAll = useCallback(() => setGenres(allGenres), []);
  const unselectAll = useCallback(() => setGenres([]), []);

  return (
    <form onSubmit={handleSubmit(handleSearch)}>
      <Paper className="bg-white p-4 space-y-4">
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
          {genreFilter}
          <Button onClick={selectAll}>全選択</Button>
          <Button onClick={unselectAll}>全解除</Button>
        </fieldset>
        <fieldset>
          <legend className="font-bold text-sm text-slate-500">話数</legend>
          <Controller
            name="min"
            control={control}
            render={({ field: { onChange, value } }) => (
              <StoryCount value={value} defaultValue={1} onUpdate={onChange}>
                最小
              </StoryCount>
            )}
          />
          ～
          <Controller
            name="max"
            control={control}
            render={({ field: { onChange, value } }) => (
              <StoryCount value={value} defaultValue={1} onUpdate={onChange}>
                最大
              </StoryCount>
            )}
          />
        </fieldset>
        <fieldset>
          <legend className="font-bold text-sm text-slate-500">
            更新開始日
          </legend>
          <FirstUpdateDatePicker control={control} />
        </fieldset>
        <fieldset>
          <legend className="font-bold text-sm text-slate-500">更新状態</legend>
          <Checkbox {...register("rensai")} />
          連載中
          <Checkbox {...register("kanketsu")} />
          完結
          <Checkbox {...register("tanpen")} />
          短編
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
