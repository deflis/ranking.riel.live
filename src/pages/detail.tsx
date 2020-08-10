import { NarouSearchResult } from 'narou';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useTitle } from 'react-use';

import Alert from '@material-ui/lab/Alert';

import useDetail from '../api/useDetail';
import DetailItem from '../components/detail/DetailItem';
import FakeItem from '../components/detail/FakeItem';
import { RankingHistoryRender } from '../components/detail/RankingHistoryRender';
import { RankingHistories } from '../interface/RankingHistory';

type Result = {
  detail: NarouSearchResult;
  ranking: RankingHistories;
};

const DetailRenderer: React.FC<Result> = ({ detail, ranking }) => {
  return (
    <>
      <DetailItem item={detail} />
      <RankingHistoryRender ranking={ranking} />
    </>
  );
};

const Detail: React.FC = () => {
  const { ncode } = useParams<{ ncode: string }>();

  const { result, loading } = useDetail(ncode);

  useTitle(
    result
      ? `${result.detail.title} - なろうランキングビューワ`
      : "なろうランキングビューワ"
  );

  if (loading) {
    return <FakeItem />;
  } else if (result) {
    return <DetailRenderer {...result} />;
  }
  return (
    <Alert severity="warning">
      情報が見つかりません。この小説は削除された可能性があります。
    </Alert>
  );
};
export default Detail;
