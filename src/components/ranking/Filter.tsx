import React, { useState, useEffect, useCallback } from "react";
import Genre from "../../enum/Genre";
import { RankingResult } from "narou";
import ReactDatePicker from "react-datepicker";
import { isBefore, parse } from "date-fns";

const narouDateFormat = "yyyy-MM-dd HH:mm:ss";

export const FilterComponent: React.FC<{
  onChange: (filter: Filter) => void;
}> = ({ onChange }) => {
  const [genres, setGenres] = useState<number[]>(Array.from(Genre.keys()));
  const [max, setMax] = useState(30);
  const [min, setMin] = useState(1);
  const [enableMax, setEnableMax] = useState(false);
  const [enableMin, setEnableMin] = useState(false);
  const [firstUpdate, setFirstUpdate] = useState<Date | null>();
  const [enableTanpen, setEnableTanpen] = useState(true);
  const [enableRensai, setEnableRensai] = useState(true);
  const [enableKanketsu, setEnableKanketsu] = useState(true);

  useEffect(() => {
    onChange(
      new Filter(
        genres,
        enableMax ? max : 0,
        enableMin ? min : 0,
        firstUpdate,
        enableTanpen,
        enableRensai,
        enableKanketsu
      )
    );
  }, [
    onChange,
    genres,
    enableMax,
    max,
    enableMin,
    min,
    firstUpdate,
    enableTanpen,
    enableRensai,
    enableKanketsu
  ]);

  const genreFilter = Array.from(Genre).map(([id, name]) => {
    const genreChange = () => {
      if (genres.includes(id)) {
        setGenres(genres.filter(x => x !== id));
      } else {
        setGenres([id].concat(genres));
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
            checked={genres.includes(id)}
            onChange={genreChange}
          />
          {name}
        </label>
      </div>
    );
  });

  const selectAll = useCallback(() => {
    setGenres(Array.from(Genre.keys()));
  }, []);
  const unselectAll = useCallback(() => {
    setGenres([]);
  }, []);

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
          <p className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={enableMax}
                onChange={() => setEnableMax(!enableMax)}
              />
            </label>
          </p>
          <fieldset disabled={!enableMax}>
            <div className="field has-addons">
              <p className="control">
                <span className="button is-static">最大</span>
              </p>
              <p className="control">
                <input
                  className="input"
                  type="text"
                  defaultValue="30"
                  onChange={e => {
                    const x = parseInt(e.target.value);
                    if (x > 0) setMax(x);
                  }}
                ></input>
              </p>
              <p className="control">
                <span className="button is-static">話</span>
              </p>
            </div>
          </fieldset>
          <p className="control">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={enableMin}
                onChange={() => setEnableMin(!enableMin)}
              />
            </label>
          </p>
          <fieldset disabled={!enableMin}>
            <div className="field has-addons">
              <p className="control">
                <span className="button is-static">最小</span>
              </p>
              <p className="control">
                <input
                  className="input"
                  type="text"
                  defaultValue="1"
                  onChange={e => {
                    const x = parseInt(e.target.value);
                    if (x > 0) setMin(x);
                  }}
                ></input>
              </p>
              <p className="control">
                <span className="button is-static">話</span>
              </p>
            </div>
          </fieldset>
        </div>
      </div>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">更新開始日</label>
        </div>
        <div className="field-body">
          <p className="control">
            <ReactDatePicker
              className="input"
              dateFormat="yyyy/MM/dd"
              minDate={new Date(2013, 5, 1)}
              maxDate={new Date()}
              selected={firstUpdate}
              onChange={setFirstUpdate}
            />
          </p>
          <p className="control">
            <button className="button" onClick={() => setFirstUpdate(null)}>
              リセット
            </button>
          </p>
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
                checked={enableRensai}
                onChange={() => setEnableRensai(e => !e)}
              />
              連載
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={enableKanketsu}
                onChange={() => setEnableKanketsu(e => !e)}
              />
              完結
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={enableTanpen}
                onChange={() => setEnableTanpen(e => !e)}
              />
              短編
            </label>
          </p>
        </div>
      </div>
    </>
  );
};

export class Filter {
  constructor(
    private genres = Array.from(Genre.keys()),
    private maxNo: number = 0,
    private minNo: number = 0,
    private firstUpdate: Date | null = null,
    private enableTanpen: boolean = true,
    private enableRensai: boolean = true,
    private enableKanketsu: boolean = true
  ) {}

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
          (this.enableRensai &&
            item.novel_type === 1 &&
            item.end === 1) ||
          (this.enableKanketsu &&
            item.novel_type === 1 &&
            item.end === 0)
      );
  }
}
