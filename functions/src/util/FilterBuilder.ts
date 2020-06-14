import { NarouSearchResult } from "narou";
import { isAfter, parse } from "date-fns";

const narouDateFormat = "yyyy-MM-dd HH:mm:ss";

class FilterBuilder {
  private maxNo?: number;
  private minNo?: number;
  private firstUpdate?: Date;
  private tanpen: boolean = true;
  private rensai: boolean = true;
  private kanketsu: boolean = true;

  private execute(item: NarouSearchResult): boolean {
    if (this.maxNo && item.general_all_no > this.maxNo) {
      return false;
    }
    if (this.minNo && item.general_all_no < this.minNo) {
      return false;
    }
    if (
      this.firstUpdate &&
      isAfter(
        this.firstUpdate,
        parse(item.general_firstup, narouDateFormat, new Date())
      )
    ) {
      return false;
    }
    switch (item.novel_type) {
      case 1:
        switch (item.end) {
          case 1:
            return this.rensai;
          default:
          case 0:
            return this.kanketsu;
        }
      default:
      case 2:
        return this.tanpen;
    }
  }
  setMaxNo(maxNo: number) {
    this.maxNo = maxNo;
  }
  setMinNo(minNo: number) {
    this.minNo = minNo;
  }
  setFirstUpdate(firstUpdate: Date) {
    this.firstUpdate = firstUpdate;
  }
  disableTanpen() {
    this.tanpen = false;
  }
  disableRensai() {
    this.rensai = false;
  }
  disableKanketsu() {
    this.kanketsu = false;
  }

  create(): (item: NarouSearchResult) => boolean {
    return (item) => this.execute(item);
  }
}

export default FilterBuilder;
