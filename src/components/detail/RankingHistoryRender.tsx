import React, { useCallback } from "react";
import {
  RankingHistories,
  RankingHistoryItem,
} from "../../interface/RankingHistory";
import { RankingType } from "narou";
import {
  parseISO,
  format,
  addDays,
  isEqual,
  formatISO,
  addMonths,
  isAfter,
} from "date-fns/esm";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Brush,
} from "recharts";
import { Link as RouterLink } from "react-router-dom";
import { ja } from "date-fns/locale";
import {
  Paper,
  Tabs,
  Tab,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Link,
  Typography,
  useTheme,
  makeStyles,
  createStyles,
} from "@material-ui/core";
import { useLocalStorage } from "react-use";
import { Grid, Hidden } from "@material-ui/core";

function* rangeDate(start: Date, end: Date, type: RankingType) {
  if (!start) return;
  let date = new Date(start.getTime());
  while (!isAfter(date, end)) {
    yield date;
    switch (type) {
      case RankingType.Daily:
        date = addDays(date, 1);
        break;
      case RankingType.Weekly:
        date = addDays(date, 7);
        break;
      case RankingType.Monthly:
        date = addMonths(date, 1);
        break;
      case RankingType.Quarterly:
        date = addMonths(date, 1);
        break;
    }
  }
}

const RankingHistoryCharts: React.FC<{
  ranking: RankingHistoryItem[];
  type: RankingType;
}> = ({ ranking, type }) => {
  const theme = useTheme();

  const parsedRanking = ranking.map(({ date, ...other }) => ({
    date: parseISO(date),
    ...other,
  }));
  const date = parsedRanking.map(({ date }) => date);
  const minDate = date[0];
  const maxDate = date[date.length - 1];
  const data = Array.from(rangeDate(minDate, maxDate, type))
    .map(
      (date) =>
        parsedRanking.find((item) => isEqual(item.date, date)) ?? {
          date,
          rank: null,
          pt: null,
        }
    )
    .map(({ date, rank, pt }) => ({
      date: format(date, "yyyy年MM月dd日(E)", { locale: ja }),
      順位: rank,
      ポイント: pt,
    }));
  return (
    <Grid container spacing={3}>
      <Grid item sm={8}>
        <Hidden smDown>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="順位"
                yAxisId="left"
                stroke={theme.palette.primary.main}
              />
              <Line
                type="monotone"
                dataKey="ポイント"
                yAxisId="right"
                stroke={theme.palette.secondary.main}
              />
              <CartesianGrid stroke={theme.palette.text.secondary} />
              <XAxis dataKey="date" stroke={theme.palette.text.primary} />
              <YAxis
                reversed
                domain={[1, 300]}
                ticks={[10, 50, 100, 300]}
                allowDataOverflow
                scale="log"
                stroke={theme.palette.primary.main}
                yAxisId="left"
                label="順位"
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke={theme.palette.secondary.main}
                label="ポイント"
              />
              <Brush
                dataKey="date"
                height={30}
                stroke={theme.palette.primary.main}
              />
              <Tooltip
                contentStyle={{ background: theme.palette.background.default }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Hidden>
      </Grid>

      <Grid item sm={4}>
        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>日付</TableCell>
                <TableCell>順位</TableCell>
                <TableCell>ポイント</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parsedRanking.map(({ date, rank, pt }) => (
                <TableRow key={date.toString()}>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      to={`/ranking/${type}/${formatISO(date, {
                        representation: "date",
                      })}`}
                    >
                      {format(date, "yyyy年MM月dd日(E)", { locale: ja })}
                    </Link>
                  </TableCell>
                  <TableCell>{rank}位</TableCell>
                  <TableCell>{pt.toLocaleString()}pt</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
    title: {
      marginBottom: theme.spacing(2),
    },
  })
);

export const RankingHistoryRender: React.FC<{ ranking: RankingHistories }> = ({
  ranking,
}) => {
  const styles = useStyles();
  const [_type, setType] = useLocalStorage(
    "HistoryRankingType",
    RankingType.Daily
  );
  const type = _type ?? RankingType.Daily;
  const handleChange = useCallback(
    (_: React.ChangeEvent<{}>, newValue: RankingType) => {
      setType(newValue);
    },
    [setType]
  );
  if (
    ranking[RankingType.Daily].length === 0 &&
    ranking[RankingType.Weekly].length === 0 &&
    ranking[RankingType.Monthly].length === 0 &&
    ranking[RankingType.Quarterly].length === 0
  ) {
    return null;
  }
  return (
    <Paper className={styles.root}>
      <Typography variant="h4" component="h2" className={styles.title}>
        ランキング履歴
      </Typography>
      <Tabs
        value={type}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        centered
      >
        <Tab
          value={RankingType.Daily}
          label="日間"
          disabled={ranking[RankingType.Daily].length === 0}
        />
        <Tab
          value={RankingType.Weekly}
          label="週間"
          disabled={ranking[RankingType.Weekly].length === 0}
        />
        <Tab
          value={RankingType.Monthly}
          label="月間"
          disabled={ranking[RankingType.Monthly].length === 0}
        />
        <Tab
          value={RankingType.Quarterly}
          label="四半期"
          disabled={ranking[RankingType.Quarterly].length === 0}
        />
      </Tabs>
      <RankingHistoryCharts ranking={ranking[type]} type={type} />
    </Paper>
  );
};
