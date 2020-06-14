import React, { useState } from "react";
import { TextField, InputAdornment, Checkbox } from "@material-ui/core";
import { useBoolean, useUpdateEffect } from "react-use";
import { useHandleChange } from "../../util/useHandleChange";

export const StoryCount: React.FC<{
  value?: number;
  defaultValue: number;
  onUpdate: (n: number | undefined) => void;
}> = ({ value: initValue, defaultValue, onUpdate, children }) => {
  const [disabled, toggle] = useBoolean(initValue === undefined);
  const [value, setValue] = useState(
    initValue ? initValue.toString() : defaultValue.toString()
  );
  const handleChange = useHandleChange(setValue);
  useUpdateEffect(() => {
    setValue((initValue ?? defaultValue).toString());
    toggle(initValue === undefined);
  }, [initValue, defaultValue]);
  useUpdateEffect(
    () => {
      const n = parseInt(value);
      if (!disabled && n) {
        onUpdate(n);
      } else {
        onUpdate(undefined);
      }
    },
    [disabled, value, onUpdate]
  );
  return (
    <TextField
      onChange={handleChange}
      value={value}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Checkbox checked={!disabled} onChange={toggle} />
            {children}
          </InputAdornment>
        ),
        endAdornment: <InputAdornment position="end">話</InputAdornment>,
      }}
      disabled={disabled}
    />
  );
};
