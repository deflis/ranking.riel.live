import { DateTime, Interval } from "luxon";
import { Popover, Transition } from "@headlessui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { IoCalendarOutline, IoClose } from "react-icons/io5";
import { useCallback, useState } from "react";
import clsx from "clsx";
import { SelectBox } from "./SelectBox";
import form_styles from "./form.module.css";
import styles from "./DatePicker.module.css";

const CalenderDay: React.FC<{
  date: DateTime;
  disabled: boolean;
  selected: boolean;
  onChange: (date: DateTime) => void;
}> = ({ date, disabled, selected, onChange }) => {
  const handleClick = useCallback(
    () => !disabled && onChange(date),
    [date, disabled, onChange]
  );
  return (
    <div
      className={clsx(
        styles.day,
        !disabled && selected && styles.selected,
        !disabled && date.hasSame(DateTime.now(), "day") && styles.today,
        disabled && styles.disabled
      )}
      onClick={handleClick}
    >
      {date.day}
    </div>
  );
};

const Calender: React.FC<{
  value: DateTime | null;
  current: DateTime;
  minDate: DateTime;
  maxDate: DateTime;
  onChange: (date: DateTime) => void;
}> = ({ value, current, minDate, maxDate, onChange }) => {
  return (
    <div className={styles.calender}>
      {Interval.fromDateTimes(
        current.startOf("month").startOf("week"),
        current.endOf("month").endOf("week")
      )
        .splitBy({ day: 1 })
        .map((x) => x.start)
        .map((date) => (
          <CalenderDay
            key={date.toISODate()}
            date={date}
            disabled={
              date < minDate || date > maxDate || current.month !== date.month
            }
            selected={!!value?.hasSame(date, "day")}
            onChange={onChange}
          />
        ))}
    </div>
  );
};

export const DatePicker: React.FC<{
  value: DateTime | null;
  minDate: DateTime;
  maxDate: DateTime;
  onChange: (date: DateTime | null) => void;
  clearable?: boolean;
}> = ({ value, onChange, minDate, maxDate, clearable }) => {
  const [current, setCurrent] = useState(
    (value ?? DateTime.now()).startOf("month")
  );
  const decreaseMonth = useCallback(
    () => setCurrent((x) => x.minus({ month: 1 })),
    []
  );
  const increaseMonth = useCallback(
    () => setCurrent((x) => x.plus({ month: 1 })),
    []
  );
  const changeYear = useCallback(
    (year: number) => setCurrent((x) => x.set({ year })),
    []
  );
  const changeMonth = useCallback(
    (month: number) => setCurrent((x) => x.set({ month })),
    []
  );
  const clearDate = useCallback(() => {
    onChange(null);
  }, []);
  const prevMonthButtonDisabled = minDate > current.minus({ month: 1 });
  const nextMonthButtonDisabled = current.plus({ month: 1 }) > maxDate;
  return (
    <Popover className={styles.date_picker}>
      {({ open }) => (
        <>
          <Popover.Button className={clsx(form_styles.input, "font-mono")}>
            {value?.toFormat("yyyy/MM/dd") ?? "----/--/--"}
            <IoCalendarOutline
              className={form_styles.append_icon}
              aria-hidden="true"
            />
          </Popover.Button>

          <Transition
            show={open}
            className={styles.date_picker_transition}
            enter={styles.enter}
            enterFrom={styles.enter_from}
            enterTo={styles.enter_to}
            leave={styles.leave}
            leaveFrom={styles.leave_from}
            leaveTo={styles.leave_to}
          >
            <Popover.Panel className={styles.date_picker_panel}>
              <div className={styles.header}>
                <button
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  type="button"
                  className={clsx(
                    prevMonthButtonDisabled && styles.disabled,
                    styles.button
                  )}
                >
                  <HiChevronLeft className={styles.icon} />
                </button>

                <span className={styles.date_selector}>
                  <SelectBox
                    value={current.year}
                    options={Interval.fromDateTimes(minDate, maxDate)
                      .splitBy({ year: 1 })
                      .map((x) => x.start.startOf("year"))
                      .map((date) => ({
                        value: date.year,
                        label: date.year,
                      }))}
                    onChange={changeYear}
                  />
                  <SelectBox
                    value={current.month}
                    options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                      (month) => ({
                        value: month,
                        label: month,
                        disabled:
                          (current.year === minDate.year &&
                            current.month < minDate.month) ||
                          (current.year === maxDate.year &&
                            current.month > maxDate.month),
                      })
                    )}
                    onChange={changeMonth}
                  />
                </span>

                <button
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  type="button"
                  className={clsx(
                    nextMonthButtonDisabled && styles.disabled,
                    styles.button
                  )}
                >
                  <HiChevronRight className={styles.icon} />
                </button>
                {clearable && (
                  <button
                    onClick={clearDate}
                    type="button"
                    className={styles.button}
                  >
                    <IoClose className={styles.icon} />
                  </button>
                )}
              </div>
              <Calender
                value={value}
                current={current}
                maxDate={maxDate}
                minDate={minDate}
                onChange={onChange}
              />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

export default DatePicker;
