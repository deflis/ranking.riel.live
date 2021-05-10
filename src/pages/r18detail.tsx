import { NarouSearchResult } from "narou";
import React from "react";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";

import Alert from "@material-ui/lab/Alert";

import DetailItem from "../components/detail/DetailItem";
import FakeItem from "../components/detail/FakeItem";
import { RankingHistories } from "../interface/RankingHistory";
import { SelfAd } from "../components/common/SelfAd";
import { createStyles, makeStyles, Paper } from "@material-ui/core";
import useR18Detail from "../api/useR18Detail";

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
      <Paper className={classes.root}>
        <SelfAd />
      </Paper>
    </>
  );
};

const R18Detail: React.FC = () => {
  const { ncode } = useParams<{ ncode: string }>();

  const { result, loading } = useR18Detail(ncode);

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
export default R18Detail;
