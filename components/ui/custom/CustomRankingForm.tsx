import { DateTime } from "luxon";
import { Genre, GenreNotation } from "narou/src/index.browser";
import React, { useCallback, useEffect, useState } from "react";
import { FaCog, FaSearch, FaTimes } from "react-icons/fa";
import { useBoolean, useToggle, useUpdateEffect } from "react-use";
import { useForm, Controller, useController, Control } from "react-hook-form";

import { allGenres } from "../../../modules/enum/Genre";
import { CustomRankingParams } from "../../../modules/interfaces/CustomRankingParams";
import {
  RankingType,
  RankingTypeName,
} from "../../../modules/interfaces/RankingType";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Paper } from "../atoms/Paper";
import { StoryCount } from "../common/StoryCount";
import { TwitterShare } from "../common/TwitterShare";
import { SelectBox } from "../atoms/SelectBox";
import { TextField } from "../atoms/TextField";
import { DatePicker } from "../atoms/DatePicker";

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
    <>
      <div>
        <TwitterShare
          title={`${params.keyword ? `${params.keyword}の` : "カスタム"}${
            RankingTypeName[params.rankingType]
          }ランキング`}
        >
          ランキングを共有
        </TwitterShare>{" "}
        <Button onClick={toggleShow}>
          <FaCog />
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
    </>
  );
};

const DisableCustomRankingForm: React.FC<{
  params: CustomRankingParams;
}> = React.memo(({ params: { keyword, rankingType, genres } }) => {
  const genre =
    genres.length > 0
      ? genres
          .map((genre) => <span className="tag">{GenreNotation[genre]}</span>)
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
      <h1>
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

const FirstUpdateDatePicker: React.FC<{ control: Control<InnerParams> }> = ({
  control,
}) => {
  const {
    field: { onChange, value },
  } = useController({ control, name: "firstUpdate" });
  return (
    <DatePicker
      minDate={DateTime.fromObject({ year: 2013, month: 5, day: 1 })}
      maxDate={DateTime.now()}
      value={value ? DateTime.fromISO(value) : null}
      onChange={(value) => onChange(value?.toISODate())}
      clearable
    />
  );
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
      <label>
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
    <Paper>
      <form onSubmit={handleSubmit(handleSearch)}>
        <fieldset>
          <legend>種類</legend>
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
        </fieldset>
        <fieldset>
          <legend>キーワード</legend>
          <TextField {...register("keyword")} />
          <legend>除外キーワード</legend>
          <TextField {...register("notKeyword")} />
          <Checkbox {...register("byTitle")} />
          タイトルを含める
          <Checkbox {...register("byStory")} />
          あらすじを含める
        </fieldset>
        <fieldset>
          <legend>ジャンル</legend>
          {genreFilter}
          <Button onClick={selectAll}>全選択</Button>
          <Button onClick={unselectAll}>全解除</Button>
          未選択時は全て
        </fieldset>
        <fieldset>
          <legend>話数</legend>
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
        <div>
          <FirstUpdateDatePicker control={control} />
        </div>
        <fieldset>
          <legend>更新状態</legend>
          <Checkbox {...register("rensai")} />
          連載中
          <Checkbox {...register("kanketsu")} />
          完結
          <Checkbox {...register("tanpen")} />
          短編
        </fieldset>
        <div>
          <Button type="submit" color="primary">
            <FaSearch />
            検索
          </Button>
          <Button onClick={onClose}>
            <FaTimes />
            閉じる
          </Button>
        </div>
      </form>
    </Paper>
  );
};
