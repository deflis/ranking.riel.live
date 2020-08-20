import React, { useState, useCallback } from "react";
import Genre from "../../enum/Genre";
import { Filter } from "../../interface/Filter";
import { useLocalStorage, useDebounce } from "react-use";
import {
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Button,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { StoryCount } from "../common/StoryCount";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import jaLocale from "date-fns/locale/ja";
import { allGenres } from "../../enum/Genre";

type FilterCompnentProps = {
  onChange: (filter: Filter) => void;
};

const InnterFilterComponent: React.FC<FilterCompnentProps> = ({ onChange }) => {
  const [filter, setFilter] = useState(Filter.init());
  useDebounce(
    () => {
      onChange(filter);
    },
    1000,
    [filter, onChange]
  );

  const handleChangeGenre = useCallback(
    (e: React.ChangeEvent<{ value?: string }>) => {
      if (!e.target.value) return;
      const id = parseInt(e.target.value);
      setFilter((f) => {
        if (f.genres.includes(id)) {
          return f.setGenres(f.genres.filter((x) => x !== id));
        } else {
          return f.setGenres([id].concat(f.genres));
        }
      });
    },
    []
  );
  const genreFilter = Array.from(Genre).map(([id, name]) => {
    return (
      <FormControlLabel
        key={id}
        control={<Checkbox checked={filter.genres.includes(id)} value={id} />}
        label={name}
      />
    );
  });
  const updateMax = useCallback((max?: number | undefined) => {
    setFilter((f) => f.setMaxNo(max));
  }, []);
  const updateMin = useCallback((min: number | undefined) => {
    setFilter((f) => f.setMinNo(min));
  }, []);
  const setFirstUpdate = useCallback((firstUpdate: Date | null) => {
    setFilter((f) => f.setFirstUpdate(firstUpdate ?? undefined));
  }, []);
  const toggleEnableRensai = useCallback(() => {
    setFilter((f) => f.setEnableRensai(!f.enableRensai));
  }, []);
  const toggleEnableKanketsu = useCallback(() => {
    setFilter((f) => f.setEnableKanketsu(!f.enableKanketsu));
  }, []);
  const toggleEnableTanpen = useCallback(() => {
    setFilter((f) => f.setEnableTanpen(!f.enableTanpen));
  }, []);

  const selectAll = useCallback(() => {
    setFilter((f) => f.setGenres(allGenres));
  }, []);
  const unselectAll = useCallback(() => {
    setFilter((f) => f.setGenres([]));
  }, []);

  return (
    <form noValidate autoComplete="off" onSubmit={(e) => e.preventDefault()}>
      <FormGroup className={undefined}>
        <FormControl component="fieldset">
          <FormLabel component="legend">ジャンル</FormLabel>
          <FormGroup onChange={handleChangeGenre} row>
            {genreFilter}
          </FormGroup>
          <FormGroup row>
            <Button variant="contained" onClick={selectAll}>
              全選択
            </Button>
            <Button variant="contained" onClick={unselectAll}>
              全解除
            </Button>
          </FormGroup>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">話数</FormLabel>
          <FormGroup row>
            <StoryCount
              value={filter.minNo}
              defaultValue={1}
              onUpdate={updateMin}
            >
              最小
            </StoryCount>
            ～
            <StoryCount
              value={filter.maxNo}
              defaultValue={30}
              onUpdate={updateMax}
            >
              最大
            </StoryCount>
          </FormGroup>
        </FormControl>
        <FormControl component="fieldset">
          <MuiPickersUtilsProvider utils={DateFnsUtils} locale={jaLocale}>
            <KeyboardDatePicker
              clearable
              format="yyyy/MM/dd"
              label="更新開始日"
              minDate={new Date(2013, 5, 1)}
              maxDate={new Date()}
              value={filter.firstUpdate ?? null}
              onChange={setFirstUpdate}
            />
          </MuiPickersUtilsProvider>
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">更新状態</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filter.enableRensai}
                  onChange={toggleEnableRensai}
                />
              }
              label="連載中"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filter.enableKanketsu}
                  onChange={toggleEnableKanketsu}
                />
              }
              label="完結"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filter.enableTanpen}
                  onChange={toggleEnableTanpen}
                />
              }
              label="短編"
            />
          </FormGroup>
        </FormControl>
      </FormGroup>
    </form>
  );
};

export const FilterComponent: React.FC<FilterCompnentProps> = React.memo(
  ({ onChange }) => {
    const [showFilter, setShowFilter] = useLocalStorage("showFilter", false);
    const toggleShowFIlter = useCallback(
      (_: React.ChangeEvent<{}>, newExpanded: boolean) =>
        setShowFilter(newExpanded),
      [setShowFilter]
    );

    return (
      <ExpansionPanel expanded={showFilter} onChange={toggleShowFIlter}>
        <ExpansionPanelSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>フィルター</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <InnterFilterComponent onChange={onChange} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }
);
