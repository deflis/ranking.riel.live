import { End, NovelType } from "narou/src/index.browser";
import React from "react";
import { DetailResult } from "../../../../modules/data/loaders/detail";
import { Tags, Tag } from "../bulma/Tag";

const ItemBadge: React.FC<{ item: DetailResult }> = ({ item }) => (
  <Tags addons>
    <Tag
      tagColor={
        item.noveltype === NovelType.Tanpen
          ? "cyan"
          : item.end === End.Rensai
          ? "lightGreen"
          : undefined
      }
    >
      {item.noveltype === NovelType.Tanpen
        ? "短編"
        : item.end === End.Rensai
        ? "連載中"
        : "完結"}
    </Tag>
    {item.noveltype !== NovelType.Tanpen && (
      <Tag
        tagColor={
          item.general_all_no < 30
            ? "cyan"
            : item.general_all_no > 100
            ? "red"
            : undefined
        }
        light={item.general_all_no > 100}
      >
        全{item.general_all_no.toLocaleString()}話
      </Tag>
    )}
  </Tags>
);
export default ItemBadge;
