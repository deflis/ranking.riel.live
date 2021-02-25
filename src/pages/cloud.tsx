import { parseISO } from "date-fns";
import { addHours, format } from "date-fns/esm";
import jaLocale from "date-fns/locale/ja";
import GenreEnum from "../enum/Genre";
import React, { useCallback, useMemo } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useTitle } from "react-use";

import DateFnsUtils from "@date-io/date-fns";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  LinearProgress,
  makeStyles,
  MenuItem,
  Select,
} from "@material-ui/core";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

import useRanking, { convertDate, formatDate } from "../api/useRanking";
import { TwitterShare } from "../components/common/TwitterShare";
import { RankingType, RankingTypeName } from "../interface/RankingType";

import WordCloud from "react-wordcloud";
import { wrap } from "comlink";
import TokenizerWorker, { TokenizerApi } from "../worker/tokenizer.worker";
import { Genre, RankingResult } from "narou";
import { useQuery } from "../util/useQuery";
import { reducerForMap } from "../util/kuromoji";
import useSWR from "swr";

const tokenizerWorkerInstance = new TokenizerWorker();
const tokenizerApi = wrap<TokenizerApi>(tokenizerWorkerInstance);

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

function parseQuery({ genres }: { genres: string }): { genres: Genre[] } {
  return {
    genres: conventGenres(genres),
  };
}
function conventGenres(rawGenres: string = "") {
  return rawGenres
    .split(",")
    .map((x) => Number(x))
    .filter((x) => GenreEnum.has(x));
}

const tokenize = async (ranking: RankingResult[] | undefined) => {
  if (!Array.isArray(ranking)) return;
  return await tokenizerApi.tokenizeTitleByGenre(ranking);
};

function empty(x: any[]) {
  return x.length === 0;
}
const RankingWordCloud: React.FC = () => {
  const styles = useStyles();
  const history = useHistory();
  const { date: _date, type: _type } = useParams<RankingParams>();

  const query = useQuery<{ genres: string }>();
  const { genres } = useMemo(() => parseQuery(query), [query]);
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
      const genre = empty(genres) ? "" : `?genres=${genres.join(",")}`;
      if (formatDate(date, type) !== formatDate(defaultDate, type)) {
        history.push(`/cloud/${type}/${formatDate(date, type)}${genre}`);
      } else {
        history.push(`/cloud/${type}${genre}`);
      }
    },
    [_date, history, genres]
  );

  const onDateChange = useCallback(
    (date: Date | null) => {
      const defaultDate = addHours(new Date(), -12);
      const type = (_type as RankingType) ?? RankingType.Daily;
      const genre = empty(genres) ? "" : `?genres=${genres.join(",")}`;
      if (date && formatDate(date, type) !== formatDate(defaultDate, type)) {
        history.push(`/cloud/${type}/${formatDate(date, type)}${genre}`);
      } else {
        history.push(`/cloud/${type}${genre}`);
      }
    },
    [_type, history, genres]
  );

  const onGenreChange = useCallback(
    (newGenres: Genre[]) => {
      const defaultDate = addHours(new Date(), -12);
      const date = _date ? parseISO(_date) : defaultDate;
      const type = (_type as RankingType) ?? RankingType.Daily;
      const genre = empty(newGenres)
        ? ""
        : `?genres=${newGenres.sort().join(",")}`;
      if (date && formatDate(date, type) !== formatDate(defaultDate, type)) {
        history.push(`/cloud/${type}/${formatDate(date, type)}${genre}`);
      } else {
        history.push(`/cloud/${type}${genre}`);
      }
    },
    [_type, _date, history]
  );

  const clearDate = useCallback(() => onDateChange(null), [onDateChange]);
  useTitle(
    `${_date ? format(date, "yyyy/MM/dd") : "最新"}の${RankingTypeName.get(
      type
    )}ランキング - なろうランキングビューワ`
  );

  const { loading, ranking } = useRanking(type, date);

  const { data: tokens, error } = useSWR([ranking], tokenize);
  if (error) throw error;
  const parsing = !tokens;
  const words = useMemo(() => {
    if (!tokens) return [];
    return Array.from(
      tokens
        .filter(([tokenGenre]) => empty(genres) || genres.includes(tokenGenre))
        .flatMap(([, words]) => Array.from(words.entries()))
        .reduce(
          reducerForMap<[string, number], string, number>(
            ([word]) => word,
            (previous, [, current]) => (previous ?? 0) + current
          ),
          new Map<string, number>()
        )
        .entries()
    ).map(([text, value]) => ({ text, value }));
  }, [tokens, genres]);

  const handleChangeGenre = useCallback(
    (e: React.ChangeEvent<{ value?: string }>) => {
      if (!e.target.value) return;
      const id = parseInt(e.target.value) as Genre;
      if (genres.includes(id)) {
        onGenreChange(genres.filter((x) => x !== id));
      } else {
        onGenreChange([id].concat(genres));
      }
    },
    [genres, onGenreChange]
  );
  const genreFilter = Array.from(GenreEnum).map(([id, name]) => {
    return (
      <FormControlLabel
        key={id}
        control={<Checkbox checked={genres.includes(id)} value={id} />}
        label={name}
      />
    );
  });
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
          <FormControl component="fieldset">
            <FormLabel component="legend">ジャンル</FormLabel>
            <FormGroup onChange={handleChangeGenre} row>
              {genreFilter}
            </FormGroup>
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
      {(loading || parsing) && <LinearProgress />}
      {loading && "データを取得しています..."}
      {!loading && parsing && "データを加工しています..."}

      {words && <WordCloud words={words} options={{}} />}
    </>
  );
};

export default RankingWordCloud;
