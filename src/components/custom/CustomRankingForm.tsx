import React, { useState, useCallback } from "react";
import Genre from "../../enum/Genre";
import { RankingType, RankingTypeName } from "../../interface/RankingType";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { TwitterShare } from "../common/TwitterShare";
import { useToggle, useUpdateEffect } from "react-use";
import {
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  FormHelperText,
  InputLabel,
  Paper,
  makeStyles,
  createStyles,
} from "@material-ui/core";

const useStyles = makeStyles((theme) =>
  createStyles({
    bar: {
      display: "flex",
      justifyContent: "flex-end",
      marginBottom: theme.spacing(1),
      "& > *:not(:last-child)": {
        marginRight: theme.spacing(1),
      },
    },
    form: {
      padding: theme.spacing(2),
      "& > form > *": {
        marginBottom: theme.spacing(1),
      },
      "& > form > *:not(:last-child)": {
        marginRight: theme.spacing(1),
      },
    },
  })
);

export interface CustomRankingFormEvent {
  keyword?: string;
  genres: number[];
  rankingType: RankingType;
}

export interface CustomRankingFormParams {
  keyword?: string;
  genres: number[];
  rankingType: RankingType;
  onSearch: (e: CustomRankingFormEvent) => void;
}

interface InnterParams {
  toggleShow: () => void;
}

export const CustomRankingForm: React.FC<CustomRankingFormParams> = (
  params
) => {
  const styles = useStyles();
  const [show, toggleShow] = useToggle(false);

  return (
    <>
      <div className={styles.bar}>
        <TwitterShare
          title={`${
            params.keyword ? `${params.keyword}の` : "カスタム"
          }${RankingTypeName.get(params.rankingType)}ランキング`}
        >
          ランキングを共有
        </TwitterShare>{" "}
        <Button onClick={toggleShow} variant="contained" startIcon={<FontAwesomeIcon icon={faCog} />}>
          編集
        </Button>
      </div>
      {show ? (
        <EnableCustomRankingForm {...params} toggleShow={toggleShow} />
      ) : (
        <DisableCustomRankingForm {...params} />
      )}
    </>
  );
};

const DisableCustomRankingForm: React.FC<CustomRankingFormParams> = ({
  keyword,
  genres,
  rankingType,
}) => {
  const genre =
    genres.length > 0
      ? genres
          .map((genre) => <span className="tag">{Genre.get(genre)}</span>)
          .reduce(
            (previous, current) => (
              <>
                {previous} {current}
              </>
            ),
            <>ジャンル: </>
          )
      : "ジャンル設定なし";
  return (
    <>
      <Typography variant="h2" component="h1">
        {keyword ? `${keyword}の` : "カスタム"}
        {RankingTypeName.get(rankingType)}ランキング
      </Typography>
      <Typography variant="subtitle1" component="h2">
        {genre}
      </Typography>
    </>
  );
};

const RankingTypeOptions = Array.from(
  RankingTypeName.entries()
).map(([value, label]) => <MenuItem value={value}>{label}</MenuItem>);

const EnableCustomRankingForm: React.FC<
  CustomRankingFormParams & InnterParams
> = ({
  keyword: defaultKeyword,
  genres: defaultGenres,
  rankingType: defaultType,
  onSearch,
  toggleShow,
}) => {
  const styles = useStyles();

  const [keyword, setKeyword] = useState(defaultKeyword);
  const [genres, setGenres] = useState<number[]>(defaultGenres);
  const [rankingType, setRankingType] = useState<RankingType>(defaultType);

  useUpdateEffect(() => {
    setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  useUpdateEffect(() => {
    setGenres(defaultGenres);
  }, [defaultGenres]);

  useUpdateEffect(() => {
    setRankingType(defaultType);
  }, [defaultType]);

  const handleChangeGenre = useCallback(
    (e: React.ChangeEvent<{ value?: string }>) => {
      if (!e.target.value) return;
      const id = parseInt(e.target.value);
      setGenres((genres) => {
        if (genres.includes(id)) {
          return genres.filter((x) => x !== id);
        } else {
          return [id].concat(genres).sort();
        }
      });
    },
    []
  );
  const genreFilter = Array.from(Genre).map(([id, name]) => {
    return (
      <FormControlLabel
        key={id}
        control={<Checkbox checked={genres.includes(id)} value={id} />}
        label={name}
      />
    );
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSearch({ keyword, genres: genres, rankingType });
    },
    [onSearch, keyword, genres, rankingType]
  );

  const handleChangeKeyword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value);
    },
    []
  );

  const handleChangeType = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setRankingType(e.target.value as RankingType);
    },
    []
  );

  return (
    <Paper className={styles.form}>
      <form onSubmit={handleSubmit}>
        <FormControl>
          <InputLabel id="ranking-type">種類</InputLabel>
          <Select
            labelId="ranking-type"
            value={rankingType}
            onChange={handleChangeType}
          >
            {RankingTypeOptions}
          </Select>
        </FormControl>
        <TextField
          label="キーワード"
          value={keyword}
          onChange={handleChangeKeyword}
          helperText="(未入力時はすべて)"
        />
        <FormControl>
          <FormLabel>ジャンル</FormLabel>
          <FormGroup onChange={handleChangeGenre} row>
            {genreFilter}
          </FormGroup>
          <FormHelperText>(未選択時は全て)</FormHelperText>
        </FormControl>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<FontAwesomeIcon icon={faSearch} />}
        >
          検索
        </Button>
        <Button
          onClick={toggleShow}
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faTimes} />}
        >
          閉じる
        </Button>
      </form>
    </Paper>
  );
};
