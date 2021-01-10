import React, { useCallback, useState, useEffect } from 'react';
import {
  makeStyles,
  createStyles,
  Theme,
  TextField,
  StandardTextFieldProps,
  FilledTextFieldProps,
  OutlinedTextFieldProps,
} from '@material-ui/core';
import clsx from 'clsx';
import { useDebounce } from 'react-use';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    input: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
  })
);

export type NumberTextFieldProps =
  | (Omit<StandardTextFieldProps, 'value' | 'onChange' | 'defaultValue'> & {
      value: number;
      onChange: (value: number) => void;
      onRawChange?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void;
      errorMessage?: React.ReactNode;
      demical?: boolean;
    })
  | (Omit<FilledTextFieldProps, 'value' | 'onChange' | 'defaultValue'> & {
      value: number;
      onChange: (value: number) => void;
      onRawChange?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void;
      errorMessage?: React.ReactNode;
      demical?: boolean;
    })
  | (Omit<OutlinedTextFieldProps, 'value' | 'onChange' | 'defaultValue'> & {
      value: number;
      onChange: (value: number) => void;
      onRawChange?: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => void;
      errorMessage?: React.ReactNode;
      demical?: boolean;
    });

function hankaku2Zenkaku(str: string): string {
  return str
    .replace(/[０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    })
    .replace(/．/g, '.');
}

const integerRegex = /^[0-9０-９]+$/;
const demicalRegex = /^[0-9０-９]+([.．][0-9０-９]*)?$/;

const parseInteger = (v: string) => parseInt(hankaku2Zenkaku(v));
const parseDemical = (v: string) => parseFloat(hankaku2Zenkaku(v));

export const NumberTextField: React.FC<NumberTextFieldProps> = ({
  className,
  value,
  onChange,
  onRawChange,
  onBlur,
  error: rawError,
  errorMessage,
  demical,
  ...props
}) => {
  const classess = useStyles();
  const [state, setState] = useState(value.toString());
  const [error, setError] = useState(rawError ?? false);

  useEffect(() => {
    setState(value.toString());
  }, [value]);
  useEffect(() => {
    setError(
      (rawError ?? false) || !state.match(demical ? demicalRegex : integerRegex)
    );
  }, [rawError, state, demical]);
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onRawChange && onRawChange(event);
      setState(event.target.value);
    },
    [onRawChange]
  );
  const parse = useCallback(() => {
    if (!error) {
      const newValue = demical ? parseDemical(state) : parseInteger(state);
      if (newValue !== value) {
        onChange(newValue);
        setState(newValue.toString());
      }
    }
  }, [demical, state, value, error, onChange]);
  useDebounce(() => parse(), 10000, [parse]);
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      parse();
      onBlur && onBlur(event);
    },
    [parse, onBlur]
  );

  return (
    <TextField
      className={clsx(className, classess.input)}
      value={state}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      helperText={error ? errorMessage ?? '数字ではありません' : undefined}
      {...props}
    />
  );
};

export default NumberTextField;
