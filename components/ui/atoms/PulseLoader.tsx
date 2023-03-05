import clsx from "clsx";
import React from "react";

export const PulseLoader: React.FC<
  React.HTMLAttributes<HTMLDivElement> & { disabled?: boolean }
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
