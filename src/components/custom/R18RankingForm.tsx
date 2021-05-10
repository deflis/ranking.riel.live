import { set } from "date-fns/esm";
import jaLocale from "date-fns/locale/ja";
import { R18Site, R18SiteNotation } from "narou";
import React, { useCallback, useState } from "react";
import { useBoolean, useToggle, useUpdateEffect } from "react-use";

import DateFnsUtils from "@date-io/date-fns";
import { faCog, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Button,
  Checkbox,
  createStyles,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  InputLabel,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  KeyboardDateTimePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";

import { R18RankingParams } from "../../interface/CustomRankingParams";
import { RankingType, RankingTypeName } from "../../interface/RankingType";
import { StoryCount } from "../common/StoryCount";
import { TwitterShare } from "../common/TwitterShare";

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
export interface R18RankingFormParams {
  params: R18RankingParams;
  onSearch: (e: R18RankingParams) => void;
}

interface InnterParams {
  onClose: () => void;
}

export const R18RankingForm: React.FC<R18RankingFormParams> = ({
  params,
  onSearch,
}) => {
  const styles = useStyles();
  const [show, toggleShow] = useToggle(false);

  return (
    <>
      <div className={styles.bar}>
        <TwitterShare
          title={`【R18】${
            params.keyword ? `${params.keyword}の` : "カスタム"
          }${RankingTypeName.get(params.rankingType)}ランキング`}
        >
          ランキングを共有
        </TwitterShare>{" "}
        <Button
          onClick={toggleShow}
          variant="contained"
          startIcon={<FontAwesomeIcon icon={faCog} />}
        >
          編集
        </Button>
      </div>
      {show ? (
        <EnableCustomRankingForm
          params={params}
          onSearch={onSearch}
          onClose={toggleShow}
        />
      ) : (
        <DisableCustomRankingForm params={params} />
      )}
    </>
  );
};

const DisableCustomRankingForm: React.FC<{
  params: R18RankingParams;
}> = React.memo(({ params: { keyword, rankingType, sites } }) => {
  const genre =
    sites.length > 0
      ? sites
          .map((site) => <span className="tag">{R18SiteNotation[site]}</span>)
          .reduce(
            (previous, current) => (
              <>
                {previous} {current}
              </>
            ),
            <>サイト: </>
          )
      : "サイト設定なし";
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
});

const RankingTypeOptions = Array.from(
  RankingTypeName.entries()
).map(([value, label]) => <MenuItem value={value}>{label}</MenuItem>);

const EnableCustomRankingForm: React.FC<
  R18RankingFormParams & InnterParams
> = ({ params, onSearch, onClose }) => {
  const styles = useStyles();

  const [keyword, setKeyword] = useState(params.keyword);
  const [notKeyword, setNotKeyword] = useState(params.notKeyword);
  const [byStory, toggleByStory] = useBoolean(params.byStory);
  const [byTitle, toggleByTitle] = useBoolean(params.byTitle);
  const [sites, setSites] = useState(params.sites);
  const [min, setMin] = useState(params.min);
  const [max, setMax] = useState(params.max);
  const [firstUpdate, setFirstUpdate] = useState(params.firstUpdate);
  const [rensai, toggleRensai] = useBoolean(params.rensai);
  const [kanketsu, toggleKanketsu] = useBoolean(params.kanketsu);
  const [tanpen, toggleTanpen] = useBoolean(params.tanpen);
  const [rankingType, setRankingType] = useState(params.rankingType);

  useUpdateEffect(() => {
    setKeyword(params.keyword);
    setNotKeyword(params.notKeyword);
    toggleByStory(params.byStory);
    toggleByTitle(params.byTitle);
    setSites(params.sites);
    setMin(params.min);
    setMax(params.max);
    setFirstUpdate(params.firstUpdate);
    toggleRensai(params.rensai);
    toggleKanketsu(params.kanketsu);
    toggleTanpen(params.tanpen);
    setRankingType(params.rankingType);
  }, [params]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSearch({
        keyword,
        notKeyword,
        byStory,
        byTitle,
        sites,
        min,
        max,
        firstUpdate,
        rensai,
        kanketsu,
        tanpen,
        rankingType,
      });
    },
    [
      onSearch,
      keyword,
      notKeyword,
      byStory,
      byTitle,
      sites,
      min,
      max,
      firstUpdate,
      rensai,
      kanketsu,
      tanpen,
      rankingType,
    ]
  );

  const handleChangeKeyword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value);
    },
    []
  );

  const handleChangeNotKeyword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNotKeyword(e.target.value);
    },
    []
  );

  const handleChangeSite = useCallback(
    (e: React.ChangeEvent<{ value?: string }>) => {
      if (!e.target.value) return;
      const id = parseInt(e.target.value);
      setSites((sites) => {
        if (sites.includes(id)) {
          return sites.filter((x) => x !== id);
        } else {
          return [id].concat(sites).sort();
        }
      });
    },
    []
  );

  const handleChangeMin = useCallback((n: number | undefined) => setMin(n), []);
  const handleChangeMax = useCallback((n: number | undefined) => setMax(n), []);

  const handleChangeFirstUpdate = useCallback((date: Date | null) => {
    setFirstUpdate(date ?? undefined);
  }, []);

  const handleChangeType = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      setRankingType(e.target.value as RankingType);
    },
    []
  );
  const selectAll = useCallback(
    () =>
      setSites([
        R18Site.Nocturne,
        R18Site.MoonLight,
        R18Site.MoonLightBL,
        R18Site.Midnight,
      ]),
    []
  );
  const unselectAll = useCallback(() => setSites([]), []);

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
        <FormGroup row>
          <TextField
            label="キーワード"
            value={keyword}
            onChange={handleChangeKeyword}
            helperText="(未入力時はすべて)"
          />
          <TextField
            label="除外キーワード"
            value={notKeyword}
            onChange={handleChangeNotKeyword}
          />
          <FormControlLabel
            control={<Checkbox checked={byTitle} onChange={toggleByTitle} />}
            label="タイトルを含める"
          />
          <FormControlLabel
            control={<Checkbox checked={byStory} onChange={toggleByStory} />}
            label="あらすじを含める"
          />
        </FormGroup>
        <FormControl>
          <FormLabel>サイト</FormLabel>
          <FormGroup onChange={handleChangeSite} row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={sites.includes(R18Site.Nocturne)}
                  value={R18Site.Nocturne}
                />
              }
              label={R18SiteNotation[R18Site.Nocturne]}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sites.includes(R18Site.Nocturne)}
                  value={R18Site.Nocturne}
                />
              }
              label={R18SiteNotation[R18Site.Nocturne]}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sites.includes(R18Site.MoonLight)}
                  value={R18Site.MoonLight}
                />
              }
              label={R18SiteNotation[R18Site.MoonLight]}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sites.includes(R18Site.MoonLightBL)}
                  value={R18Site.MoonLightBL}
                />
              }
              label={R18SiteNotation[R18Site.MoonLightBL]}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={sites.includes(R18Site.Midnight)}
                  value={R18Site.Midnight}
                />
              }
              label={R18SiteNotation[R18Site.Midnight]}
            />
          </FormGroup>
          <FormGroup row>
            <Button variant="contained" onClick={selectAll}>
              全選択
            </Button>
            <Button variant="contained" onClick={unselectAll}>
              全解除
            </Button>
          </FormGroup>
          <FormHelperText>(未選択時は全て)</FormHelperText>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">話数</FormLabel>
          <FormGroup row>
            <StoryCount value={min} defaultValue={1} onUpdate={handleChangeMin}>
              最小
            </StoryCount>
            ～
            <StoryCount
              value={max}
              defaultValue={30}
              onUpdate={handleChangeMax}
            >
              最大
            </StoryCount>
          </FormGroup>
        </FormControl>
        <div>
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={jaLocale}>
            <KeyboardDateTimePicker
              clearable
              format="yyyy/MM/dd HH:mm:ss"
              label="更新開始日"
              minDate={new Date(2013, 5, 1)}
              maxDate={new Date()}
              value={firstUpdate ?? null}
              initialFocusedDate={set(new Date(), {
                hours: 0,
                minutes: 0,
                seconds: 0,
                milliseconds: 0,
              })}
              onChange={handleChangeFirstUpdate}
            />
          </MuiPickersUtilsProvider>
        </div>
        <FormControl component="fieldset">
          <FormLabel component="legend">更新状態</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={<Checkbox checked={rensai} onChange={toggleRensai} />}
              label="連載中"
            />
            <FormControlLabel
              control={
                <Checkbox checked={kanketsu} onChange={toggleKanketsu} />
              }
              label="完結"
            />
            <FormControlLabel
              control={<Checkbox checked={tanpen} onChange={toggleTanpen} />}
              label="短編"
            />
          </FormGroup>
        </FormControl>
        <div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={<FontAwesomeIcon icon={faSearch} />}
          >
            検索
          </Button>
          <Button
            onClick={onClose}
            variant="contained"
            startIcon={<FontAwesomeIcon icon={faTimes} />}
          >
            閉じる
          </Button>
        </div>
      </form>
    </Paper>
  );
};
