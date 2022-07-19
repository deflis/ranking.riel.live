import React from "react";
import {
  NarouSearchResult,
  NovelType,
  R18SiteNotation,
} from "narou/src/index.browser";
import { AllHtmlEntities } from "html-entities";
import Genre from "../../enum/Genre";
import { formatDistance, format } from "date-fns";
import { ja } from "date-fns/locale";
import { Link as RouterLink } from "react-router-dom";
import { TwitterShare } from "../common/TwitterShare";
import { OutboundLink } from "react-ga";
import AdSense from "../common/AdSense";
import {
  Typography,
  Link,
  Chip,
  Grid,
  Hidden,
  Table,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  TableBody,
  Button,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import createStyles from "@mui/styles/createStyles";
import { Tag, Tags } from "../common/bulma/Tag";
import StoryRender from "../common/StoryRender";
import DetailItemText from "./DetailItemText";
import { Paper } from "@mui/material";
import ItemBadge from "../common/badges/ItemBadge";
import { parse } from "../../util/NarouDateFormat";
import { FirstAd } from "../common/FirstAd";
import { AdRandomWidth } from "../common/AdRandom";
import { ItemResult } from "../../../modules/data/loaders/items";
import { ItemDetailResult } from "../../../modules/data/queries/item";

const useStyles = makeStyles((theme) =>
  createStyles({
    titleBox: {
      marginBottom: theme.spacing(1),
    },
    storyTitle: {
      marginBottom: theme.spacing(2),
    },
    story: {
      padding: theme.spacing(1),
    },
    tableBox: {
      padding: theme.spacing(2),
    },
    tableBoxTitle: {
      marginBottom: theme.spacing(2),
    },
  })
);
const entities = new AllHtmlEntities();
const baseDate = new Date();
const formatOptions = { locale: ja };

function formatRelative(date: string): string {
  return formatDistance(parse(date), baseDate, {
    locale: ja,
  });
}
function formatDate(date: string): string {
  return format(parse(date), "yyyy年MM月dd日 hh:mm:ss", formatOptions);
}
function round(number: number, precision: number): number {
  const shift = function (
    number: number,
    precision: number,
    reverseShift: boolean
  ) {
    if (reverseShift) {
      precision = -precision;
    }
    const numArray = ("" + number).split("e");
    return +(
      numArray[0] +
      "e" +
      (numArray[1] ? +numArray[1] + precision : precision)
    );
  };
  return shift(Math.round(shift(number, precision, false)), precision, true);
}

const DetailItem: React.FC<{ item: ItemDetailResult }> = ({ item }) => {
  const styles = useStyles();
  const isR18 = false; //item.nocgenre !== undefined;
  const baseUrl = isR18
    ? "https://novel18.syosetu.com"
    : "https://ncode.syosetu.com";
  const ncode = item.ncode.toLowerCase();
  const detail = `${baseUrl}/novelview/infotop/ncode/${ncode}/`;
  const user = `https://mypage.syosetu.com/${item.userid}/`;
  const link = `${baseUrl}/${ncode}/`;
  const linkFirst = `${baseUrl}/${ncode}/1/`;
  const linkLast = `${baseUrl}/${ncode}/${item.general_all_no}/`;
  const keywords = item.keyword
    .split(/\s/g)
    .map((keyword) => (
      <Chip
        key={keyword}
        component={RouterLink}
        to={isR18 ? `/r18?keyword=${keyword}` : `/custom?keyword=${keyword}`}
        label={keyword}
      />
    ));

  return (
    <>
      <div className={styles.titleBox}>
        <Typography variant="subtitle1">
          <Tag as="a" href={link} target="_blank" rel="noopener noreferrer">
            {item.ncode}
          </Tag>{" "}
          <Link
            component={RouterLink}
            to={`/custom?genres=${item.genre}`}
            rel="noopener noreferrer"
          >
            {Genre.get(item.genre)}
          </Link>
        </Typography>
        <Typography variant="h4" component="h1">
          <Link
            color="textPrimary"
            component={OutboundLink}
            eventLabel="DetailItem-title"
            to={link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {entities.decode(item.title)}
          </Link>
        </Typography>
        <Typography variant="subtitle2">
          <ItemBadge item={item} />
          {item.noveltype === NovelType.Tanpen ? (
            <Link
              component={OutboundLink}
              eventLabel="DetailItem-read"
              to={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              読む
            </Link>
          ) : (
            <>
              <Link
                component={OutboundLink}
                eventLabel="DetailItem-readFirst"
                to={linkFirst}
                target="_blank"
                rel="noopener noreferrer"
              >
                第1話を読む
              </Link>{" "}
              |{" "}
              <Link
                component={OutboundLink}
                eventLabel="DetailItem-reaLast"
                to={linkLast}
                target="_blank"
                rel="noopener noreferrer"
              >
                最新話を読む
              </Link>
            </>
          )}
          <Tag>
            {Math.round(item.length / item.general_all_no).toLocaleString()}
            文字/話
          </Tag>
        </Typography>
      </div>
      <FirstAd />
      <Grid container spacing={3}>
        <Grid item sm={7}>
          <Typography className={styles.storyTitle} variant="h5" component="h2">
            あらすじ
          </Typography>
          <StoryRender
            className={styles.story}
            story={item.story}
            variant="body1"
          />
        </Grid>
        <Grid item sm={5}>
          <DetailItemText label="作者">
            {isR18 ? (
              entities.decode(item.writer)
            ) : (
              <Link
                component={OutboundLink}
                eventLabel="DetailItem-UserPage"
                to={user}
                target="_blank"
                rel="noopener noreferrer"
              >
                {entities.decode(item.writer)}
              </Link>
            )}
          </DetailItemText>
          {item.genre && (
            <DetailItemText label="ジャンル">
              <Link component={RouterLink} to={`/custom?genres=${item.genre}`}>
                {Genre.get(item.genre)}
              </Link>
            </DetailItemText>
          )}
          {item.nocgenre && (
            <DetailItemText label="ジャンル">
              <Link component={RouterLink} to={`/r18?genres=${item.nocgenre}`}>
                {R18SiteNotation[item.nocgenre]}
              </Link>
            </DetailItemText>
          )}
          <DetailItemText label="キーワード">
            <Tags>{keywords}</Tags>
          </DetailItemText>
          <DetailItemText label="掲載日">
            {formatDate(item.general_firstup)} （
            {formatRelative(item.general_firstup)}前）
          </DetailItemText>
          <DetailItemText label="最新部分掲載日">
            {formatDate(item.general_lastup)} （
            {formatRelative(item.general_lastup)}前）
          </DetailItemText>
          <DetailItemText label="感想">
            {item.impression_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText label="レビュー">
            {item.review_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText label="ブックマーク登録">
            {item.fav_novel_cnt.toLocaleString()}件
          </DetailItemText>
          <DetailItemText label="総合評価">
            {item.all_point.toLocaleString()}pt /{" "}
            {item.all_hyoka_cnt.toLocaleString()}人 = 平均
            {round(item.all_point / item.all_hyoka_cnt, 2).toLocaleString()}
            pt
          </DetailItemText>
          <DetailItemText label="文字数">
            {item.length.toLocaleString()}文字 / 全
            {item.general_all_no.toLocaleString()}話 ={" "}
            {Math.round(item.length / item.general_all_no).toLocaleString()}
            文字/話
          </DetailItemText>
          <DetailItemText label="更新日時">
            {formatDate(item.novelupdated_at as any as string)}
          </DetailItemText>
          <Hidden lgDown>
            <AdSense></AdSense>
          </Hidden>
        </Grid>
      </Grid>
      <AdRandomWidth />
      <Paper className={styles.tableBox}>
        <Typography
          variant="h4"
          component="h2"
          className={styles.tableBoxTitle}
        >
          獲得ポイント
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>総合評価ポイント</TableCell>
                <TableCell>日間</TableCell>
                <TableCell>週間</TableCell>
                <TableCell>月間</TableCell>
                <TableCell>四半期</TableCell>
                <TableCell>年間</TableCell>
                <TableCell>週間UU</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{item.global_point.toLocaleString()}</TableCell>
                <TableCell>{item.daily_point.toLocaleString()}</TableCell>
                <TableCell>{item.weekly_point.toLocaleString()}</TableCell>
                <TableCell>{item.monthly_point.toLocaleString()}</TableCell>
                <TableCell>{item.quarter_point.toLocaleString()}</TableCell>
                <TableCell>{item.yearly_point.toLocaleString()}</TableCell>
                <TableCell>{item.weekly_unique.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <p>
        <Button
          variant="contained"
          component={OutboundLink}
          eventLabel="DetailItem-detauil"
          to={detail}
          target="_blank"
          rel="noopener noreferrer"
        >
          小説情報
        </Button>{" "}
        <Button
          variant="contained"
          component={OutboundLink}
          eventLabel="DetailItem-readButton"
          to={link}
          target="_blank"
          rel="noopener noreferrer"
        >
          読む
        </Button>{" "}
        <TwitterShare title={`${item.title}のランキング履歴`}>
          ランキング履歴を共有
        </TwitterShare>
      </p>
      <AdSense></AdSense>
    </>
  );
};

export default DetailItem;
