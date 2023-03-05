import clsx from "clsx";
import { ComponentProps } from "react";

export const PulseLoader: React.FC<
  ComponentProps<"div"> & { disabled?: boolean }
> = ({ className, disabled = false, ...props }) => (
  <div
    className={clsx(
      !disabled && "animate-pulse",
      "w-full bg-slate-700 rounded h-4 inline-block",
      className
    )}
    {...props}
  />
);
