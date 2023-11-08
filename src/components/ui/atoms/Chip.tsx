import clsx from "clsx";
import {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  PropsWithChildren,
  PropsWithRef,
  ReactElement,
  forwardRef,
} from "react";

type ChipProps<T extends ElementType = "a"> = {
  as?: T;
  color?: "primary";
} & PropsWithChildren<Omit<ComponentPropsWithoutRef<T>, "as" | "color">>;

function ChipBase<T extends ElementType = "a">(
  { className, as, children, ...props }: ChipProps<T>,
  ref: ForwardedRef<T>
) {
  const Component = as ?? "a";
  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={clsx(
        "link-reset box-border rounded-full bg-gray-200 inline-flex text-sm h-8 justify-center align-middle items-center dark:bg-zinc-700",
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Chip: Chip = forwardRef(ChipBase) as any;
