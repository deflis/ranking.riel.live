import globalClassNames, {
  ClassNames as GlobalClassNames,
} from "......style.d";
declare const classNames: typeof globalClassNames & {
  readonly tags: "tags";
  readonly tag: "tag";
  readonly "5": "5";
  readonly addon: "addon";
  readonly cyan: "cyan";
  readonly lightGreen: "lightGreen";
  readonly red: "red";
};
export default classNames;
export type ClassNames =
  | "tags"
  | "tag"
  | "5"
  | "addon"
  | "cyan"
  | "lightGreen"
  | "red"
  | GlobalClassNames;
