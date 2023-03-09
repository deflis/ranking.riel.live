import React, {
  useCallback,
  useState,
  useEffect,
  InputHTMLAttributes,
} from "react";
import clsx from "clsx";
import { useDebounce } from "react-use";
import { TextField } from "../atoms/TextField";

export type NumberTextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "defaultValue"
> & {
  value: number;
  onChange: (value: number) => void;
  onRawChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: React.ReactNode;
  demical?: boolean;
};

function hankaku2Zenkaku(str: string): string {
  return str
    .replace(/[０-９]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
    })
    .replace(/．/g, ".");
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
    (event: React.ChangeEvent<HTMLInputElement>) => {
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

  // 10秒経つと強制的にパースする
  useDebounce(() => parse(), 10000, [parse]);

  // blurイベントでパースする
  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      parse();
      onBlur && onBlur(event);
    },
    [parse, onBlur]
  );

  return (
    <TextField
      {...props}
      className={clsx(className)}
      value={state}
      onChange={handleChange}
      onBlur={handleBlur}
      type="number"
    />
  );
};

export default NumberTextField;
