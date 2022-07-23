import React, {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  forwardRef,
  PropsWithRef,
  ReactElement,
} from "react";
import { tag, tags, addon, cyan, lightGreen, red } from "./Tag.module.css";
import clsx from "clsx";
/*
Bulmaからの移植のため、ライセンスをここに書いておく。
https://github.com/jgthms/bulma/blob/master/sass/elements/tag.sass

The MIT License (MIT)

Copyright (c) 2020 Jeremy Thomas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

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
        tag,
        tagColor === "cyan" && cyan,
        tagColor === "lightGreen" && lightGreen,
        tagColor === "red" && red,
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
}> = ({ addons: addonsFlag, children }) => (
  <span className={clsx(tags, addonsFlag && addon)}>{children}</span>
);
