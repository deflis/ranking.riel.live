import { DateTime } from "luxon";
import { useController, Control } from "react-hook-form";

import { DatePicker } from "../atoms/DatePicker";

export const FirstUpdateDatePicker = ({
  control,
}: {
  control: Control<any>;
}) => {
  const {
    field: { onChange, value },
  } = useController({ control, name: "firstUpdate" });
  return (
    <DatePicker
      minDate={DateTime.fromObject({ year: 2013, month: 5, day: 1 })}
      maxDate={DateTime.now()}
      value={value ? DateTime.fromISO(value) : null}
      onChange={(value) => onChange(value?.toISODate())}
      clearable
    />
  );
};
