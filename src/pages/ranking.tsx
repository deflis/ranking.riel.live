import React, { useState, useCallback } from "react";
import { RankingResult } from "narou";
import ky from "ky";
import {
  format,
  formatISO,
  setDay,
  startOfMonth,
  addDays,
  getDay,
  addHours,
} from "date-fns/esm";
import { FilterComponent } from "../components/ranking/Filter";
import { Filter } from "../interface/Filter";
import { useParams, useHistory } from "react-router-dom";
import { parseISO } from "date-fns";
import { RankingRender } from "../components/ranking/RankingRender";
import { RankingType, RankingTypeName } from "../interface/RankingType";
import { TwitterShare } from "../components/common/TwitterShare";
import { useAsync, useTitle } from "react-use";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import jaLocale from "date-fns/locale/ja";
import { FormGroup } from "@material-ui/core";
import {
  Button,
  Select,
  MenuItem,
  makeStyles,
  FormControl,
  InputLabel,
} from "@material-ui/core";

export type RankingParams = {
  date?: string;
  type?: string;
};

function formatDate(date: Date, type: RankingType): string {
  return formatISO(convertDate(date, type), { representation: "date" });
}

function convertDate(date: Date, type: RankingType): Date {
  switch (type) {
    case RankingType.Daily:
    default:
      return date;
    case RankingType.Weekly:
      return addDays(setDay(date, 2), getDay(date) < 2 ? -7 : 0);
    case RankingType.Monthly:
      return startOfMonth(date);
    case RankingType.Quarter:
      return startOfMonth(date);
  }
}
const useStyles = makeStyles((theme) => ({
  form: {
    flexWrap: "wrap",
    "& > *": {
      margin: theme.spacing(1),
      marginTop: "auto",
    },
  },
  grow: {
    flexGrow: 1,
  },
}));

const Ranking: React.FC = () => {
  const styles = useStyles();
  const history = useHistory();
  const { date: _date, type: _type } = useParams<RankingParams>();

  const [filter, setFilter] = useState(Filter.init());
  const { value, loading } = useAsync(async () => {
    const type = (_type as RankingType) ?? RankingType.Daily;
    const date = _date ? parseISO(_date) : addHours(new Date(), -12);
    const result = await ky(`/_api/ranking/${type}/${formatDate(date, type)}`, {
      timeout: 60000,
    });
    return (await result.json()) as RankingResult[];
  }, [_date, _type]);
  const ranking = value ?? [];

  const onTypeChange = useCallback(
    (
      e: React.ChangeEvent<{
        value: unknown;
      }>
    ) => {
      const defaultDate = addHours(new Date(), -12);
      const date = _date ? parseISO(_date) : defaultDate;
      const type = e.target.value as RankingType;
      if (formatDate(date, type) !== formatDate(defaultDate, type)) {
        history.push(`/ranking/${type}/${formatDate(date, type)}`);
      } else if (type === RankingType.Daily) {
        history.push(`/`);
      } else {
        history.push(`/ranking/${type}`);
      }
    },
    [_date, history]
  );

  const onDateChange = useCallback(
    (date: Date | null) => {
      const defaultDate = addHours(new Date(), -12);
      const type = (_type as RankingType) ?? RankingType.Daily;
      if (date && formatDate(date, type) !== formatDate(defaultDate, type)) {
        history.push(`/ranking/${type}/${formatDate(date, type)}`);
      } else if (type === RankingType.Daily) {
        history.push(`/`);
      } else {
        history.push(`/ranking/${type}`);
      }
    },
    [_type, history]
  );

  const clearDate = useCallback(() => onDateChange(null), [onDateChange]);

  const type = (_type as RankingType) ?? RankingType.Daily;
  const date = convertDate(
    _date ? parseISO(_date) : addHours(new Date(), -12),
    type
  );

  useTitle(
    `${_date ? format(date, "yyyy/MM/dd") : "最新"}の${RankingTypeName.get(
      type
    )}ランキング - なろうランキングビューワ`
  );

  return (
    <>
      <form noValidate autoComplete="off">
        <FormGroup className={styles.form} row>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={jaLocale}>
            <KeyboardDatePicker
              format="yyyy/MM/dd"
              label="日付"
              minDate={new Date(2013, 5, 1)}
              maxDate={new Date()}
              value={date}
              onChange={onDateChange}
            />
          </MuiPickersUtilsProvider>
          <FormControl>
            <Button onClick={clearDate} variant="contained" color="primary">
              リセット
            </Button>
          </FormControl>
          <FormControl>
            <InputLabel id="type">種類</InputLabel>
            <Select
              label="種類"
              labelId="type"
              value={type}
              onChange={onTypeChange}
            >
              <MenuItem value={RankingType.Daily}>日間</MenuItem>
              <MenuItem value={RankingType.Weekly}>週間</MenuItem>
              <MenuItem value={RankingType.Monthly}>月間</MenuItem>
              <MenuItem value={RankingType.Quarter}>四半期</MenuItem>
            </Select>
          </FormControl>
          <div className={styles.grow}></div>
          <TwitterShare
            title={`${
              _date ? format(date, "yyyy/MM/dd") : "最新"
            }の${RankingTypeName.get(type)}ランキング`}
          >
            ランキングを共有
          </TwitterShare>
        </FormGroup>
      </form>
      <FilterComponent onChange={setFilter} />

      <RankingRender ranking={ranking} filter={filter} loading={loading} />
    </>
  );
};

export default Ranking;
