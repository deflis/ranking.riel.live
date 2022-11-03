import { DateTime, Interval } from "luxon";
import { Popover, Transition } from "@headlessui/react";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import { IoCalendarOutline, IoClose } from "react-icons/io5";
import { useCallback, useState } from "react";
import clsx from "clsx";
import { SelectBox } from "./SelectBox";

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
        selected && "bg-blue-500 text-white",
        date.diffNow("day").get("day") === 0 && "bg-blue-300 text-white",
        !disabled && "cursor-pointer text-gray-700 hover:bg-blue-200",
        disabled && "text-gray-200",
        "w-full px-1 mb-1 rounded-full leading-loose transition ease-in-out duration-100",
        "text-center"
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
    <div className="grid grid-cols-7">
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
            selected={value == date}
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
    <Popover className="relative inline-block text-left">
      {({ open }) => (
        <>
          <Popover.Button className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-indigo-500 font-mono">
            {value?.toFormat("yyyy/MM/dd") ?? "----/--/--"}
            <IoCalendarOutline
              className="-mr-1 ml-2 h-5 w-5"
              aria-hidden="true"
            />
          </Popover.Button>

          <Transition
            show={open}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Popover.Panel className="w-72 origin-top-right absolute left-0 mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="flex items-center justify-between px-2 py-2">
                <div className="space-x-2">
                  <button
                    onClick={decreaseMonth}
                    disabled={prevMonthButtonDisabled}
                    type="button"
                    className={clsx(
                      prevMonthButtonDisabled &&
                        "cursor-not-allowed opacity-50",
                      "inline-flex p-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
                    )}
                  >
                    <HiChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>

                  <span className="text-lg text-gray-700">
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
                      nextMonthButtonDisabled &&
                        "cursor-not-allowed opacity-50",
                      "inline-flex p-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
                    )}
                  >
                    <HiChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                  {clearable && (
                    <button
                      onClick={clearDate}
                      type="button"
                      className={clsx(
                        "inline-flex p-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-blue-500"
                      )}
                    >
                      <IoClose className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>
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
