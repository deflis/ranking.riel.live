import React, { PropsWithChildren, useState } from "react";
import { useBoolean, useUpdateEffect } from "react-use";
import { useHandleChange } from "../../../modules/utils/useHandleChange";
import { Checkbox } from "../atoms/Checkbox";
import { TextField } from "../atoms/TextField";

export const StoryCount: React.FC<
  PropsWithChildren<{
    value?: number;
    defaultValue: number;
    onUpdate: (n: number | undefined) => void;
  }>
> = ({ value: initValue, defaultValue, onUpdate, children }) => {
  const [disabled, toggle] = useBoolean(initValue === undefined);
  const [value, setValue] = useState(
    initValue ? initValue.toString() : defaultValue.toString()
  );
  const handleChange = useHandleChange(setValue);
  useUpdateEffect(() => {
    setValue((initValue ?? defaultValue).toString());
    toggle(initValue === undefined);
  }, [initValue, defaultValue]);
  useUpdateEffect(() => {
    const n = parseInt(value);
    if (!disabled && n) {
      onUpdate(n);
    } else {
      onUpdate(undefined);
    }
  }, [disabled, value, onUpdate]);
  return (
    <>
      <label>
        <Checkbox checked={!disabled} onChange={toggle} />
        {children}
      </label>
      <TextField
        onChange={handleChange}
        value={value}
        disabled={disabled}
        className="w-20"
      />
      話
    </>
  );
};
