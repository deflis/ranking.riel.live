import clsx from "clsx";
import { ComponentProps } from "react";

export const PulseLoader: React.FC<
  ComponentProps<"span"> & { disabled?: boolean }
> = ({ className, disabled = false, ...props }) => (
  <span
    className={clsx(
      !disabled && "animate-pulse",
      "w-full bg-slate-300 dark:bg-slate-700 rounded h-4 inline-block",
      className
    )}
    {...props}
  />
);
