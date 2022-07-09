import React, { useState, useCallback } from "react";
import { useLocalStorage, useDebounce } from "react-use";
import {
  Accordion,
  AccordionSummary,
  Typography,
  AccordionDetails,
  Checkbox,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Button,
  Input,
  TextField,
} from "@mui/material";
import { StoryCount } from "../common/StoryCount";
import { DatePicker, DesktopDatePicker } from "@mui/x-date-pickers";
import { useAtom } from "jotai";
import {
  enableKanketsuAtom,
  enableRensaiAtom,
  enableTanpenAtom,
  firstUpdateAtom,
  genresAtom,
  maxNoAtom,
  minNoAtom,
} from "../../../modules/atoms/filter";
import Genre, { allGenres } from "../../../modules/enum/Genre";
import { useHydrateAtoms } from "jotai/utils";

const InnterFilterComponent: React.FC = () => {
  useHydrateAtoms([
    [enableKanketsuAtom, true],
    [enableRensaiAtom, true],
    [enableTanpenAtom, true],
    [firstUpdateAtom, undefined],
    [genresAtom, allGenres],
    [maxNoAtom, 0],
    [minNoAtom, 0],
  ] as const);
  const [genres, setGenres] = useAtom(genresAtom);
  const handleChangeGenre = useCallback(
    (e: React.ChangeEvent<{ value?: string }>) => {
      if (!e.target.value) return;
      const id = parseInt(e.target.value);
      if (genres.includes(id)) {
        return setGenres(genres.filter((x) => x !== id));
      } else {
        return setGenres([id].concat(genres));
      }
    },
    []
  );
  const genreFilter = Array.from(Genre).map(([id, name]) => (
    <FormControlLabel
      key={id}
      control={<Checkbox checked={genres.includes(id)} value={id} />}
      label={name}
    />
  ));

  const [maxNo, setMaxNo] = useAtom(maxNoAtom);
  const updateMax = useCallback((max: number | undefined) => setMaxNo(max), []);
  const [minNo, setMinNo] = useAtom(minNoAtom);
  const updateMin = useCallback((min: number | undefined) => setMinNo(min), []);
  const [firstUpdate, setFirstUpdate] = useAtom(firstUpdateAtom);
  const updateFirstUpdate = useCallback(
    (firstUpdate: Date | null) => setFirstUpdate(firstUpdate ?? undefined),
    []
  );
  const [enableRensai, setEnableRensai] = useAtom(enableRensaiAtom);
  const toggleEnableRensai = useCallback(
    () => setEnableRensai(!enableRensai),
    []
  );
  const [enableKanketsu, setEnableKanketsu] = useAtom(enableKanketsuAtom);
  const toggleEnableKanketsu = useCallback(
    () => setEnableKanketsu(!enableKanketsu),
    []
  );
  const [enableTanpen, setEnableTanpen] = useAtom(enableTanpenAtom);
  const toggleEnableTanpen = useCallback(
    () => setEnableTanpen(!enableTanpen),
    []
  );

  const selectAll = useCallback(() => setGenres(allGenres), []);
  const unselectAll = useCallback(() => setGenres([]), []);

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
            <StoryCount value={minNo} defaultValue={1} onUpdate={updateMin}>
              最小
            </StoryCount>
            ～
            <StoryCount value={maxNo} defaultValue={30} onUpdate={updateMax}>
              最大
            </StoryCount>
          </FormGroup>
        </FormControl>
        <FormControl component="fieldset">
          <DesktopDatePicker
            label="更新開始日"
            minDate={new Date(2013, 5, 1)}
            maxDate={new Date()}
            value={firstUpdate ?? null}
            onChange={updateFirstUpdate}
            inputFormat="yyyy/MM/dd"
            renderInput={(params) => <TextField {...params} />}
          />
        </FormControl>
        <FormControl component="fieldset">
          <FormLabel component="legend">更新状態</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableRensai}
                  onChange={toggleEnableRensai}
                />
              }
              label="連載中"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableKanketsu}
                  onChange={toggleEnableKanketsu}
                />
              }
              label="完結"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={enableTanpen}
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

export const FilterComponent: React.FC = () => {
  const [showFilter, setShowFilter] = useLocalStorage("showFilter", false);
  const toggleShowFIlter = useCallback(
    (_: React.ChangeEvent<{}>, newExpanded: boolean) =>
      setShowFilter(newExpanded),
    [setShowFilter]
  );

  return (
    <Accordion expanded={showFilter} onChange={toggleShowFIlter}>
      <AccordionSummary
        expandIcon={<></>}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography>フィルター</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <InnterFilterComponent />
      </AccordionDetails>
    </Accordion>
  );
};
