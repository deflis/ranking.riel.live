import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  PropsWithRef,
  ReactElement,
} from "react";

type ChipProps<T extends ElementType = "a"> = {
  as?: T;
  color?: "primary";
} & PropsWithChildren<Omit<ComponentPropsWithoutRef<T>, "as" | "color">>;

function ChipBase<T extends ElementType = "a">(
  { className, as, color, children, ...props }: ChipProps<T>,
  ref: ForwardedRef<T>
) {
  const Component = as ?? "a";
  return (
    <Component
      ref={ref as any}
      className={clsx(
        "link-reset box-border rounded-full bg-gray-200 inline-flex text-sm h-8 justify-center align-middle items-center dark:bg-gray-700",
        className
      )}
      {...props}
    >
      <span className="px-2">{children}</span>
    </Component>
  );
}

interface Chip {
  <T extends ElementType = "a">(
    x: PropsWithRef<ChipProps<T>>
  ): ReactElement | null;
}

export const Chip: Chip = forwardRef(ChipBase) as any;
