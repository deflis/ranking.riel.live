import React, {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  PropsWithRef,
  ReactElement,
} from "react";
import clsx from "clsx";

type ColorName = "cyan" | "lightGreen" | "red";

export type TagProps<T extends ElementType = "span"> = {
  as?: T;
  tagColor?: ColorName;
  light?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "light" | "tagColor">;

function TagBase<T extends ElementType = "span">(
  { as, tagColor, light, className, ...props }: TagProps<T>,
  ref?: ForwardedRef<T>
) {
  const Component = as ?? "span";
  return (
    <Component
      ref={ref as any}
      className={clsx(
        "link-reset",
        "tag",
        tagColor === "cyan" && "tag-cyan",
        tagColor === "lightGreen" && "tag-light-green",
        tagColor === "red" && "tag-red",
        light && "tag-light",
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

export const Tag: Tag = forwardRef(TagBase) as any;

export const Tags: React.FC<{
  addons?: boolean;
  children: React.ReactNode;
}> = ({ addons, children }) => (
  <span className={clsx("tags", addons && "addon")}>{children}</span>
);
