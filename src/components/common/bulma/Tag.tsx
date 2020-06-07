import React from "react";
import { makeStyles, createStyles } from "@material-ui/core";
import clsx from "clsx";
import {
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
} from "@material-ui/core/colors";

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

type StyleProps = { addon?: boolean };

const useStyles = makeStyles(
  (theme) => {
    const backgroundColor =
      theme.palette.type === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[700];

    return createStyles({
      tag: {
        backgroundColor,
        color: theme.palette.getContrastText(backgroundColor),
        borderRadius: 4,
        display: "inline-flex",
        justifyContent: "center",
        paddingLeft: theme.spacing(0.75),
        paddingRight: theme.spacing(0.75),
        whiteSpace: "nowrap",
        fontSize: "80%",
      },
      tags: {
        alignItems: "center",
        display: "inline-flex",
        flexWrap: "wrap",
        justifyContent: "flex-start",
        "& $tag": {
          "&:not(:last-child)": {
            marginRight: theme.spacing(0.5),
          },
          marginBottom: theme.spacing(0.5),
        },
        "&$hasAddons > $tag": {
          marginRight: [0, "!important"],
          "&:not(:first-child)": {
            marginLeft: 0,
            borderBottomLeftRadius: 0,
            borderTopLeftRadius: 0,
          },
          "&:not(:last-child)": {
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
          },
        },
      },
      hasAddons: {},
    });
  },
  { name: "BulmaLikeTags" }
);

const colors = {
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  lightBlue,
  lightGreen,
  lime,
  orange,
  pink,
  purple,
  red,
  teal,
  yellow,
};
type ColorName = keyof typeof colors;
const colorNames = [
  "blueGrey",
  "brown",
  "cyan",
  "deepOrange",
  "deepPurple",
  "green",
  "grey",
  "indigo",
  "lightBlue",
  "lightGreen",
  "lime",
  "orange",
  "pink",
  "purple",
  "red",
  "teal",
  "yellow",
] as const;

const useColorStyles = makeStyles((theme) => {
  const styles = colorNames.map((colorName) => {
    const color = colors[colorName];
    return createStyles({
      [colorName]: {
        backgroundColor: color[500],
        color: theme.palette.common.white,
        "&$light": {
          backgroundColor: color[100],
          color: color[700],
        },
      },
    });
  });
  return createStyles<ColorName | "light", {}>(
    Object.assign({ light: {} }, ...styles)
  );
});

export type TagProps = {
  color?: ColorName;
  light?: boolean;
};

type TagPropsWithComponent<C extends React.ElementType> = {
  component?: C;
} & TagProps &
  React.ComponentPropsWithRef<C>;

type TagFC = <C extends React.ElementType = "span">(
  props: React.PropsWithChildren<TagPropsWithComponent<C>>
) => React.ReactElement;

export const Tag: TagFC = ({
  component,
  children,
  color,
  light,
  className,
  ...props
}) => {
  const Component = component ?? "span";
  const style = useStyles({});
  const colorStyles = useColorStyles();
  return (
    <Component
      className={clsx(
        style.tag,
        className,
        color && colorStyles[color as ColorName],
        light && colorStyles.light
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export const Tags: React.FC<{ addons?: boolean }> = ({
  children,
  addons: addon,
}) => {
  const style = useStyles();
  return (
    <span className={clsx(style.tags, addon && style.hasAddons)}>
      {children}
    </span>
  );
};
