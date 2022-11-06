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
import { allGenres } from "../../../modules/enum/Genre";
import { DateTime } from "luxon";
import { Button } from "../atoms/Button";
import DatePicker from "../atoms/DatePicker";
import { Checkbox } from "../atoms/Checkbox";
import { Disclosure, Transition } from "@headlessui/react";
import { HiChevronDown } from "react-icons/hi";
import clsx from "clsx";
import { Genre, GenreNotation } from "narou/src/index.browser";
import styles from "./Filter.module.css";

const InnerFilterComponent: React.FC = () => {
  const [genres, setGenres] = useAtom(genresAtom);
  const handleChangeGenre = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.value) return;
      const id = parseInt(e.target.value) as Genre;
      setGenres((genres) =>
        genres.includes(id)
          ? genres.filter((x) => x !== id)
          : [...genres, id].sort()
      );
    },
    [setGenres]
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

  const selectAll = useCallback(
    () => setGenres(allGenres as unknown as Genre[]),
    [setGenres]
  );
  const unselectAll = useCallback(() => setGenres([]), [setGenres]);

  return (
    <form noValidate autoComplete="off" onSubmit={(e) => e.preventDefault()}>
      <div className={styles.container}>
        <fieldset>
          <legend className={styles.label}>ジャンル</legend>
          {genreFilter}
          <Button onClick={selectAll}>全選択</Button>
          <Button onClick={unselectAll}>全解除</Button>
        </fieldset>
        <fieldset>
          <legend className={styles.label}>話数</legend>
          <StoryCount value={minNo} defaultValue={1} onUpdate={updateMin}>
            最小
          </StoryCount>
          ～
          <StoryCount value={maxNo} defaultValue={30} onUpdate={updateMax}>
            最大
          </StoryCount>
        </fieldset>
        <fieldset>
          <legend className={styles.label}>更新開始日</legend>
          <DatePicker
            minDate={DateTime.fromObject({ year: 2013, month: 5, day: 1 })}
            maxDate={DateTime.now()}
            value={firstUpdate ?? null}
            onChange={updateFirstUpdate}
            clearable
          />
        </fieldset>
        <fieldset>
          <legend className={styles.label}>更新状態</legend>
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
    <Disclosure as="div" className={styles.filter}>
      {({ open }) => (
        <>
          <Disclosure.Button className={styles.button}>
            <span className={styles.label}>フィルター</span>
            <HiChevronDown className={clsx(styles.icon, open && styles.open)} />
          </Disclosure.Button>
          <Transition
            className={styles.filter_transition}
            enter={styles.enter}
            enterFrom={styles.enter_from}
            enterTo={styles.enter_to}
            leave={styles.leave}
            leaveFrom={styles.leave_from}
            leaveTo={styles.leave_to}
          >
            <Disclosure.Panel className="">
              <InnerFilterComponent />
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
  );
};
