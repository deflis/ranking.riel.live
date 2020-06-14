import { RankingResult } from "narou";
import { isBefore, parseISO, formatISO, isValid } from "date-fns";
import store from "store";
import { allGenres } from '../enum/Genre';
import { parse } from '../util/NarouDateFormat';

export interface FilterInterface {
  execute(items: RankingResult[]): RankingResult[];
}

export class DummyFilter implements FilterInterface {
  execute(items: RankingResult[]) {
    return items;
  }
}

export class Filter implements FilterInterface {
  private constructor(
    genres: number[],
    maxNo: number | undefined,
    minNo: number | undefined,
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
    const genre: number[] = store.get("genres", allGenres);
    const _maxNo: number | undefined = store.get("maxNo", undefined);
    const maxNo: number | undefined = _maxNo === 0 ? undefined : _maxNo;
    const _minNo: number | undefined = store.get("minNo", undefined);
    const minNo: number | undefined = _minNo === 0 ? undefined : _minNo;
    const firstUpdate: string | undefined = store.get("firstUpdate", undefined);
    const enableTanpen: boolean = store.get("enableTanpen", true);
    const enableRensai: boolean = store.get("enableRensai", true);
    const enableKanketsu: boolean = store.get("enableKanketsu", true);
    const _firstUpdate = firstUpdate ? parseISO(firstUpdate) : undefined;
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
      .filter((item) => item.title)
      .filter((item) => this.genres.includes(item.genre))
      .filter((item) => !this.maxNo || item.general_all_no <= this.maxNo)
      .filter((item) => !this.minNo || item.general_all_no >= this.minNo)
      .filter(
        (item) =>
          !this.firstUpdate ||
          isBefore(
            this.firstUpdate,
            parse(item.general_firstup)
          )
      )
      .filter(
        (item) =>
          (this.enableTanpen && item.novel_type === 2) ||
          (this.enableRensai && item.novel_type === 1 && item.end === 1) ||
          (this.enableKanketsu && item.novel_type === 1 && item.end === 0)
      );
  }
  private _genres: number[];
  private _maxNo?: number;
  private _minNo?: number;
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
  setMaxNo(maxNo?: number) {
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
  setMinNo(minNo?: number) {
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
