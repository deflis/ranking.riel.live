import { isSameDay, parseISO } from "date-fns";
import { addHours, format } from "date-fns/esm";
import jaLocale from "date-fns/locale/ja";
import React, { useCallback, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTitle } from "react-use";

import DateFnsUtils from "@date-io/date-fns";
import {
  Button,
  FormControl,
  FormGroup,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

import useRanking, {
  addDate,
  convertDate,
  formatDate,
} from "../api/useRanking";
import { TwitterShare } from "../components/common/TwitterShare";
import { FilterComponent } from "../components/ranking/Filter";
import { RankingRender } from "../components/ranking/RankingRender";
import { Filter } from "../interface/Filter";
import { RankingType, RankingTypeName } from "../interface/RankingType";

export type RankingParams = {
  date?: string;
  type?: string;
};

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

  const type = (_type as RankingType) ?? RankingType.Daily;
  const date = convertDate(
    _date ? parseISO(_date) : addHours(new Date(), -12),
    type
  );

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
  useTitle(
    `${_date ? format(date, "yyyy/MM/dd") : "最新"}の${RankingTypeName.get(
      type
    )}ランキング - なろうランキングビューワ`
  );

  const prevDate = useCallback(() => onDateChange(addDate(date, type, -1)), [
    onDateChange,
    date,
    type,
  ]);

  const nextDate = useCallback(() => onDateChange(addDate(date, type, 1)), [
    onDateChange,
    date,
    type,
  ]);

  const { ranking, loading } = useRanking(type, date);

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
            <Button onClick={prevDate} variant="contained">
              前
            </Button>
          </FormControl>
          <FormControl>
            <Button onClick={clearDate} variant="contained" color="primary">
              最新
            </Button>
          </FormControl>
          <FormControl>
            <Button
              onClick={nextDate}
              variant="contained"
              disabled={isSameDay(date, convertDate(new Date(), type))}
            >
              次
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
