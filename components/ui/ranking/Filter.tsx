import React, { useState, useCallback } from "react";
import { useLocalStorage, useDebounce } from "react-use";
import { StoryCount } from "../common/StoryCount";
import { useAtom } from "jotai";
import {
  enableKanketsuAtom,
  enableRensaiAtom,
  enableTanpenAtom,
  firstUpdateAtom,
  genresAtom,
  maxNoAtom,
  minNoAtom,
} from "../../../modules/atoms/filter";
import Genre, { allGenres } from "../../../modules/enum/Genre";
import { useHydrateAtoms } from "jotai/utils";
import { DateTime } from "luxon";
import { Button } from "../atoms/Button";
import DatePicker from "../atoms/DatePicker";
import { Checkbox } from "../atoms/Checkbox";
import { Disclosure } from "@headlessui/react";

const InnterFilterComponent: React.FC = () => {
  useHydrateAtoms([
    [enableKanketsuAtom, true],
    [enableRensaiAtom, true],
    [enableTanpenAtom, true],
    [firstUpdateAtom, undefined],
    [genresAtom, allGenres],
    [maxNoAtom, 0],
    [minNoAtom, 0],
  ] as const);
  const [genres, setGenres] = useAtom(genresAtom);
  const handleChangeGenre = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) return;
      const id = parseInt(e.target.value);
      setGenres((genres) =>
        genres.includes(id) ? genres.filter((x) => x !== id) : [...genres, id]
      );
    },
    [setGenres]
  );
  const genreFilter = Array.from(Genre).map(([id, name]) => (
    <React.Fragment key={id}>
      <label>
        <Checkbox
          checked={genres.includes(id)}
          value={id}
          onChange={handleChangeGenre}
        />
        {name}
      </label>
    </React.Fragment>
  ));

  const [maxNo, setMaxNo] = useAtom(maxNoAtom);
  const updateMax = useCallback((max: number | undefined) => setMaxNo(max), []);
  const [minNo, setMinNo] = useAtom(minNoAtom);
  const updateMin = useCallback((min: number | undefined) => setMinNo(min), []);
  const [firstUpdate, setFirstUpdate] = useAtom(firstUpdateAtom);
  const updateFirstUpdate = useCallback(
    (firstUpdate: DateTime | null) => setFirstUpdate(firstUpdate ?? undefined),
    [setFirstUpdate]
  );
  const [enableRensai, setEnableRensai] = useAtom(enableRensaiAtom);
  const toggleEnableRensai = useCallback(
    () => setEnableRensai((x) => !x),
    [setEnableRensai]
  );
  const [enableKanketsu, setEnableKanketsu] = useAtom(enableKanketsuAtom);
  const toggleEnableKanketsu = useCallback(
    () => setEnableKanketsu((x) => !x),
    [setEnableKanketsu]
  );
  const [enableTanpen, setEnableTanpen] = useAtom(enableTanpenAtom);
  const toggleEnableTanpen = useCallback(
    () => setEnableTanpen((x) => !x),
    [setEnableTanpen]
  );

  const selectAll = useCallback(() => setGenres(allGenres), [setGenres]);
  const unselectAll = useCallback(() => setGenres([]), [setGenres]);

  return (
    <form noValidate autoComplete="off" onSubmit={(e) => e.preventDefault()}>
      <div>
        <fieldset>
          <legend>ジャンル</legend>
          {genreFilter}
          <Button onClick={selectAll}>全選択</Button>
          <Button onClick={unselectAll}>全解除</Button>
        </fieldset>
        <fieldset>
          <legend>話数</legend>
          <StoryCount value={minNo} defaultValue={1} onUpdate={updateMin}>
            最小
          </StoryCount>
          ～
          <StoryCount value={maxNo} defaultValue={30} onUpdate={updateMax}>
            最大
          </StoryCount>
        </fieldset>
        <fieldset>
          <DatePicker
            minDate={DateTime.fromObject({ year: 2013, month: 5, day: 1 })}
            maxDate={DateTime.now()}
            value={firstUpdate ?? null}
            onChange={updateFirstUpdate}
          />
        </fieldset>
        <fieldset>
          <legend>更新状態</legend>
          <Checkbox checked={enableRensai} onChange={toggleEnableRensai} />
          連載中
          <Checkbox checked={enableKanketsu} onChange={toggleEnableKanketsu} />
          完結
          <Checkbox checked={enableTanpen} onChange={toggleEnableTanpen} />
          短編
        </fieldset>
      </div>
    </form>
  );
};

export const FilterComponent: React.FC = () => {
  return (
    <Disclosure>
      <Disclosure.Button className="py-2">フィルター</Disclosure.Button>
      <Disclosure.Panel className="text-gray-500">
        <InnterFilterComponent />
      </Disclosure.Panel>
    </Disclosure>
  );
};
