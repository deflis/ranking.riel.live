import React from "react";
import { useTitle } from "react-use";

import { DetailRenderer } from "@/components/ui/detail/DetailRenderer";
import { useR18DetailForView } from "@/modules/data/r18item";
import { useParams } from "@/router";

export const R18Detail: React.FC = () => {
  const params = useParams("/r18/detail/:ncode");
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ncode = params.ncode!;

  const { item, detail, isLoading, error } = useR18DetailForView(ncode);

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
      ranking={undefined}
      isNotFound={(!item && !isLoading) || !!error}
      isR18={true}
    />
  );
};

export default R18Detail;
