import { NarouSearchResult } from "narou";
import React from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";

import Alert from "@material-ui/lab/Alert";

import useDetail from "../api/useDetail";
import DetailItem from "../components/detail/DetailItem";
import FakeItem from "../components/detail/FakeItem";
import { RankingHistoryRender } from "../components/detail/RankingHistoryRender";
import { RankingHistories } from "../interface/RankingHistory";
import { SelfAd } from "../components/common/SelfAd";
import { createStyles, makeStyles, Paper } from "@material-ui/core";
import { AdAmazonWidth } from "../components/common/AdAmazon";
import AdSense from "../components/common/AdSense";

type Result = {
  detail: NarouSearchResult;
  ranking: RankingHistories;
};

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      marginTop: theme.spacing(2),
      padding: theme.spacing(2),
    },
  })
);

const DetailRenderer: React.FC<Result> = ({ detail, ranking }) => {
  const classes = useStyles();
  return (
    <>
      <DetailItem item={detail} />
      <RankingHistoryRender ranking={ranking} />
      <Paper className={classes.root}>
        <SelfAd />
      </Paper>
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
    <>
      <AdAmazonWidth />
      <Alert severity="warning">
        情報が見つかりません。この小説は削除された可能性があります。
      </Alert>
      <AdSense />
    </>
  );
};
export default Detail;
