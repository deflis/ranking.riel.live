import clsx from "clsx";
import { PropsWithChildren } from "react";

export const Paper: React.FC<PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => (
  <div
    className={clsx(
      "border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 block box-border",
      className
    )}
  >
    {children}
  </div>
);
