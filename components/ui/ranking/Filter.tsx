import React, { useCallback } from "react";
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
import { Disclosure, Transition } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";
import clsx from "clsx";

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
        genres.includes(id)
          ? genres.filter((x) => x !== id)
          : [...genres, id].sort()
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
    <Disclosure
      as="div"
      className="w-full border rounded-lg m-4 border-gray-200 shadow-md "
    >
      {({ open }) => (
        <>
          <Disclosure.Button className="py-2 w-full flex p-2">
            <span className="w-full">フィルター</span>
            <HiChevronDown className={clsx(open && "transform rotate-180")} />
          </Disclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="text-gray-500 border-t border-gray-200 margin-2 py-2 px-5">
              <InnterFilterComponent />
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};
