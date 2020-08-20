import { NarouSearchResult } from "narou";
import React from "react";
import { Tags, Tag } from "../bulma/Tag";

const ItemBadge: React.FC<{ item: NarouSearchResult }> = React.memo(
  ({ item }) => (
    <Tags addons>
      <Tag
        color={
          item.novel_type === 2
            ? "cyan"
            : item.end === 1
            ? "lightGreen"
            : undefined
        }
      >
        {item.novel_type === 2 ? "短編" : item.end === 1 ? "連載中" : "完結"}
      </Tag>
      {item.novel_type !== 2 && (
        <Tag
          color={
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
  )
);
export default ItemBadge;
