import React from "react";
import { useTitle } from "react-use";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";
import { useDetailForView } from "@/modules/data/item";
import { useParams } from "@/router";

export const Detail: React.FC = () => {
  const params = useParams("/detail/:ncode");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ncode = params.ncode!;

  const { item, detail, ranking, isLoading, error } = useDetailForView(ncode);

  useTitle(
    item
      ? `${item.title} - なろうランキングビューワ`
      : "なろうランキングビューワ"
  );

  return (
    <DetailRenderer
      ncode={ncode}
      item={item}
      detail={detail}
      ranking={ranking}
      isNotFound={(!item && !isLoading) || !!error}
    />
  );
};

export default Detail;
