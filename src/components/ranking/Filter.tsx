import React, { useState, useCallback } from "react";
import Genre from "../../enum/Genre";
import { RankingResult } from "narou";
import ReactDatePicker from "react-datepicker";
import { isBefore, parse, parseISO, formatISO, isValid } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import store from "store";

const narouDateFormat = "yyyy-MM-dd HH:mm:ss";

const initGenre = Array.from(Genre.keys());

const StoryCount: React.FC<{
  initValue: number;
  defaultValue: number;
  onUpdate: (n: number) => void;
}> = React.memo(
  ({ initValue, defaultValue, onUpdate, children }) => {
    const [enabled, setEnabled] = useState(initValue !== 0);
    const [value, setValue] = useState(
      initValue !== 0 ? initValue.toString() : defaultValue.toString()
    );
    const update = useCallback(
      (n: number) => {
        onUpdate(n);
        setValue(n.toString());
      },
      [onUpdate]
    );
    const toggle = useCallback(() => {
      if (enabled) {
        onUpdate(0);
        setEnabled(false);
      } else {
        const x = parseInt(value);
        onUpdate(x > 0 ? x : defaultValue);
        setEnabled(true);
      }
    }, [onUpdate, value, enabled, defaultValue]);

    return (
      <>
        <div className="field has-addons">
          <div className="control">
            <label className="button checkbox">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => toggle()}
              />
            </label>
          </div>
          <div className="control">
            <span className="button is-static">{children}</span>
          </div>
          <div className="control">
            <input
              className="input"
              type="text"
              value={value}
              onChange={e => {
                setValue(e.target.value);
                const x = parseInt(e.target.value);
                if (x > 0) update(x);
              }}
              disabled={!enabled}
            />
          </div>
          <div className="control">
            <span className="button is-static">話</span>
          </div>
        </div>
      </>
    );
  },
  (prev, next) =>
    prev.children !== next.children &&
    prev.defaultValue !== next.defaultValue &&
    prev.onUpdate !== next.onUpdate
);

type FilterCompnentProps = {
  onChange: (filter: Filter) => void;
};
const InnterFilterComponent: React.FC<FilterCompnentProps> = ({ onChange }) => {
  const [filter, setFilter] = useState(Filter.init());

  const updateGenres = useCallback(
    (genre: number[]) => {
      const newFilter = filter.setGenres(genre);
      setFilter(newFilter);
      onChange(newFilter);
    },
    [filter, onChange]
  );

  const genreFilter = Array.from(Genre).map(([id, name]) => {
    const genreChange = () => {
      if (filter.genres.includes(id)) {
        updateGenres(filter.genres.filter(x => x !== id));
      } else {
        updateGenres([id].concat(filter.genres));
      }
    };
    return (
      <div
        className="column is-one-fifth-desktop is-half-mobile control"
        key={id}
      >
        <label className="checkbox">
          <input
            type="checkbox"
            checked={filter.genres.includes(id)}
            onChange={genreChange}
          />
          {name}
        </label>
      </div>
    );
  });
  const updateMax = (max: number) => {
    const newFilter = filter.setMaxNo(max);
    setFilter(newFilter);
    onChange(newFilter);
  };
  const updateMin = (min: number) => {
    const newFilter = filter.setMinNo(min);
    setFilter(newFilter);
    onChange(newFilter);
  };
  const setFirstUpdate = (firstUpdate: Date | null) => {
    const newFilter = filter.setFirstUpdate(firstUpdate ?? undefined);
    setFilter(newFilter);
    onChange(newFilter);
  };
  const toggleEnableRensai = () => {
    const newFilter = filter.setEnableRensai(!filter.enableRensai);
    setFilter(newFilter);
    onChange(newFilter);
  };
  const toggleEnableKanketsu = () => {
    const newFilter = filter.setEnableKanketsu(!filter.enableKanketsu);
    setFilter(newFilter);
    onChange(newFilter);
  };
  const toggleEnableTanpen = () => {
    const newFilter = filter.setEnableTanpen(!filter.enableTanpen);
    setFilter(newFilter);
    onChange(newFilter);
  };

  const selectAll = useCallback(() => {
    updateGenres(initGenre);
  }, [updateGenres]);
  const unselectAll = useCallback(() => {
    updateGenres([]);
  }, [updateGenres]);

  return (
    <>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">ジャンル</label>
        </div>
        <div className="field-body">
          <div className="columns is-multiline">{genreFilter}</div>
        </div>
      </div>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label"></label>
        </div>
        <div className="field-body">
          <button className="button" onClick={selectAll}>
            全選択
          </button>
          <button className="button" onClick={unselectAll}>
            全解除
          </button>
        </div>
      </div>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">話数</label>
        </div>
        <div className="field-body">
          <StoryCount
            initValue={filter.maxNo}
            defaultValue={30}
            onUpdate={updateMax}
          >
            最大
          </StoryCount>
          ～
          <StoryCount
            initValue={filter.minNo}
            defaultValue={1}
            onUpdate={updateMin}
          >
            最小
          </StoryCount>
        </div>
      </div>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">更新開始日</label>
        </div>
        <div className="field-body">
          <div className="field has-addons">
            <div className="control has-icons-left">
              <ReactDatePicker
                className="input"
                dateFormat="yyyy/MM/dd"
                minDate={new Date(2013, 5, 1)}
                maxDate={new Date()}
                selected={filter.firstUpdate}
                onChange={setFirstUpdate}
              />
              <span className="icon is-small is-left">
                <FontAwesomeIcon icon={faCalendar} />
              </span>
            </div>
            <p className="control">
              <button
                className="button is-info"
                onClick={() => setFirstUpdate(null)}
              >
                リセット
              </button>
            </p>
          </div>
        </div>
      </div>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">更新状態</label>
        </div>
        <div className="field-body">
          <p className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filter.enableRensai}
                onChange={() => toggleEnableRensai()}
              />
              連載
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filter.enableKanketsu}
                onChange={() => toggleEnableKanketsu()}
              />
              完結
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={filter.enableTanpen}
                onChange={() => toggleEnableTanpen()}
              />
              短編
            </label>
          </p>
        </div>
      </div>
    </>
  );
};

export const FilterComponent: React.FC<FilterCompnentProps> = ({
  onChange
}) => {
  const [showFilter, setShowFilter] = useState(store.get("showFilter", false));
  const open = useCallback(() => {
    setShowFilter(true);
    store.set("showFilter", true);
  }, []);
  const close = useCallback(() => {
    setShowFilter(false);
    store.set("showFilter", false);
  }, []);

  if (showFilter) {
    return (
      <article className="message">
        <div className="message-header" onClick={() => close()}>
          フィルター
          <button className="delete" onClick={() => close()}></button>
        </div>
        <div className="message-body">
          <InnterFilterComponent onChange={onChange} />
        </div>
      </article>
    );
  } else {
    return (
      <div className="field">
        <p className="control is-expanded">
          <button
            className="button is-fullwidth is-info"
            onClick={() => open()}
          >
            フィルターを開く
          </button>
        </p>
      </div>
    );
  }
};

export class Filter {
  private constructor(
    genres: number[],
    maxNo: number,
    minNo: number,
    firstUpdate: Date | undefined,
    enableTanpen: boolean,
    enableRensai: boolean,
    enableKanketsu: boolean
  ) {
    this._genres = genres;
    this._maxNo = maxNo;
    this._minNo = minNo;
    this._firstUpdate = firstUpdate;
    this._enableTanpen = enableTanpen;
    this._enableRensai = enableRensai;
    this._enableKanketsu = enableKanketsu;
  }
  static init() {
    const genre: number[] = store.get("genres", initGenre);
    const maxNo: number = store.get("maxNo", 0);
    const minNo: number = store.get("minNo", 0);
    const firstUpdate: string | undefined = store.get("firstUpdate", undefined);
    const enableTanpen: boolean = store.get("enableTanpen", true);
    const enableRensai: boolean = store.get("enableRensai", true);
    const enableKanketsu: boolean = store.get("enableKanketsu", true);
    const _firstUpdate = firstUpdate ? parseISO(firstUpdate) : undefined,
    return new Filter(
      genre,
      maxNo,
      minNo,
      isValid(_firstUpdate) ? _firstUpdate : undefined,
      enableTanpen,
      enableRensai,
      enableKanketsu
    );
  }

  execute(items: RankingResult[]) {
    return items
      .filter(item => item.title)
      .filter(item => this.genres.includes(item.genre))
      .filter(item => this.maxNo < 1 || item.general_all_no <= this.maxNo)
      .filter(item => this.minNo < 1 || item.general_all_no >= this.minNo)
      .filter(
        item =>
          !this.firstUpdate ||
          isBefore(
            this.firstUpdate,
            parse(item.general_firstup, narouDateFormat, new Date())
          )
      )
      .filter(
        item =>
          (this.enableTanpen && item.novel_type === 2) ||
          (this.enableRensai && item.novel_type === 1 && item.end === 1) ||
          (this.enableKanketsu && item.novel_type === 1 && item.end === 0)
      );
  }

  private _genres: number[];
  private _maxNo: number;
  private _minNo: number;
  private _firstUpdate: Date | undefined;
  private _enableTanpen: boolean;
  private _enableRensai: boolean;
  private _enableKanketsu: boolean;

  get genres() {
    return this._genres;
  }
  setGenres(genres: number[]) {
    store.set("genres", genres);
    return new Filter(
      genres,
      this.maxNo,
      this.minNo,
      this.firstUpdate,
      this.enableTanpen,
      this.enableRensai,
      this.enableKanketsu
    );
  }
  get maxNo() {
    return this._maxNo;
  }
  setMaxNo(maxNo: number) {
    store.set("maxNo", maxNo);
    return new Filter(
      this.genres,
      maxNo,
      this.minNo,
      this.firstUpdate,
      this.enableTanpen,
      this.enableRensai,
      this.enableKanketsu
    );
  }
  get minNo() {
    return this._minNo;
  }
  setMinNo(minNo: number) {
    store.set("minNo", minNo);
    return new Filter(
      this.genres,
      this.maxNo,
      minNo,
      this.firstUpdate,
      this.enableTanpen,
      this.enableRensai,
      this.enableKanketsu
    );
  }
  get firstUpdate() {
    return this._firstUpdate;
  }
  setFirstUpdate(firstUpdate: Date | undefined) {
    store.set("firstUpdate", firstUpdate ? formatISO(firstUpdate) : undefined);
    return new Filter(
      this.genres,
      this.maxNo,
      this.minNo,
      firstUpdate,
      this.enableTanpen,
      this.enableRensai,
      this.enableKanketsu
    );
  }
  get enableTanpen() {
    return this._enableTanpen;
  }
  setEnableTanpen(enableTanpen: boolean) {
    store.set("enableTanpen", enableTanpen);
    return new Filter(
      this.genres,
      this.maxNo,
      this.minNo,
      this.firstUpdate,
      enableTanpen,
      this.enableRensai,
      this.enableKanketsu
    );
  }
  get enableRensai() {
    return this._enableRensai;
  }
  setEnableRensai(enableRensai: boolean) {
    store.set("enableTanpen", enableRensai);
    return new Filter(
      this.genres,
      this.maxNo,
      this.minNo,
      this.firstUpdate,
      this.enableTanpen,
      enableRensai,
      this.enableKanketsu
    );
  }
  get enableKanketsu() {
    return this._enableKanketsu;
  }
  setEnableKanketsu(enableKanketsu: boolean) {
    store.set("enableKanketsu", enableKanketsu);
    return new Filter(
      this.genres,
      this.maxNo,
      this.minNo,
      this.firstUpdate,
      this.enableTanpen,
      this.enableRensai,
      enableKanketsu
    );
  }
}
