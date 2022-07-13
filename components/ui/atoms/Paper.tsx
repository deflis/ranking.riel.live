import clsx from "clsx";
import { ComponentProps, forwardRef } from "react";

export const Paper =
  // eslint-disable-next-line react/display-name
  forwardRef<HTMLDivElement, ComponentProps<"div">>(
    ({ className, ...props }, ref) => (
      <div
        ref={ref}
        className={clsx(
          "border-gray-200 shadow-md dark:border-gray-700 block box-border rounded-lg",
          className
        )}
        {...props}
      />
    )
  );
