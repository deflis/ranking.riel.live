import clsx from "clsx";
import { ComponentProps } from "react";

type PulseLoaderProps = ComponentProps<"span"> & { disabled?: boolean };

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  className,
  disabled = false,
  ...props
}: PulseLoaderProps) => (
  <span
    className={clsx(
      !disabled && "animate-pulse",
      "w-full bg-slate-300 dark:bg-slate-700 rounded h-4 inline-block",
      className
    )}
    {...props}
  />
);

export const DotLoader: React.FC<ComponentProps<"span">> = ({ ...props }) => (
  <span className="flex justify-center w-full" {...props}>
    <span className="animate-ping h-2 w-2 bg-blue-600 rounded-full" />
    <span className="animate-ping h-2 w-2 bg-blue-600 rounded-full mx-4" />
    <span className="animate-ping h-2 w-2 bg-blue-600 rounded-full" />
  </span>
);
