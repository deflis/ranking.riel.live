import clsx from "clsx";
import React, {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  PropsWithRef,
  ReactElement,
  forwardRef,
} from "react";

import styles from "./Tag.module.css";

type ColorName = "cyan" | "lightGreen" | "red";

export type TagProps<T extends ElementType = "span"> = {
  as?: T;
  tagColor?: ColorName;
  light?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "tagColor">;

function TagBase<T extends ElementType = "span">(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { as, tagColor, className, light, ...props }: TagProps<T>,
  ref?: ForwardedRef<T>
) {
  const Component = as ?? "span";
  return (
    <Component
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={clsx(
        "link-reset",
        styles.tag,
        tagColor === "cyan" && styles.cyan,
        tagColor === "lightGreen" && styles["light-green"],
        tagColor === "red" && styles.red,
        className
      )}
      {...props}
    />
  );
}

interface Tag {
  <T extends ElementType = "a">(
    x: PropsWithRef<TagProps<T>>
  ): ReactElement | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Tag: Tag = forwardRef(TagBase) as any;

export const Tags: React.FC<{
  addons?: boolean;
  children: React.ReactNode;
}> = ({ addons, children }) => (
  <span className={clsx("tags", addons && "addon")}>{children}</span>
);
