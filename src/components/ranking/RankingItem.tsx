import React from "react";
import { R18SiteNotation, RankingResult } from "narou";
import { AllHtmlEntities } from "html-entities";
import Genre from "../../enum/Genre";
import { formatDistance, addDays, isAfter } from "date-fns";
import { ja } from "date-fns/locale";
import { addMonths } from "date-fns/esm";
import { Link as RouterLink } from "react-router-dom";
import { OutboundLink } from "react-ga";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Link,
  CardActions,
  Chip,
  makeStyles,
  createStyles,
  Paper,
  Collapse,
} from "@material-ui/core";
import { Tag, Tags } from "../common/bulma/Tag";
import { useToggle } from "react-use";
import StoryRender from "../common/StoryRender";
import ItemBadge from "../common/badges/ItemBadge";
import { parse } from "../../util/NarouDateFormat";

const entities = new AllHtmlEntities();
const baseDate = new Date();
const formatOptions = { locale: ja };

const useStyles = makeStyles((theme) =>
  createStyles({
    contents: {
      "& > *:not(:last-child)": {
        marginBottom: theme.spacing(1),
      },
    },
    title: {
      ...(theme.ranking.titleHeight !== 0
        ? {
            overflow: "hidden",
            display: "box",
            boxOrient: "vertical",
            lineClamp: theme.ranking.titleHeight,
          }
        : {}),
    },
    story: {
      margin: theme.spacing(0, 2),
      background: theme.palette.background.default,
    },
    actions: {
      justifyContent: "flex-end",
    },
    flexGap: {
      flexGrow: 1,
    },
    keywords: {
      display: theme.ranking.showKeyword ? "flex" : "none",
      flexWrap: "wrap",
      background: theme.palette.background.default,
      "& > *": {
        margin: theme.spacing(0.5),
      },
    },
  })
);

const RankingItem: React.FC<{ item: RankingResult }> = React.memo(
  ({ item }) => {
    const styles = useStyles();
    const [openStory, toggleStory] = useToggle(false);

    const isR18 = item.nocgenre !== undefined;

    const user = `https://mypage.syosetu.com/${item.userid}/`;
    const link = isR18
      ? `https://novel18.syosetu.com/${item.ncode.toLowerCase()}/`
      : `https://ncode.syosetu.com/${item.ncode.toLowerCase()}/`;
    const detail = isR18
      ? `/r18/detail/${item.ncode.toLowerCase()}`
      : `/detail/${item.ncode.toLowerCase()}`;
    const firstup = parse(item.general_firstup);
    return (
      <Card>
        <CardContent className={styles.contents}>
          <Typography color="textSecondary">
            第{item.rank}位{" "}
            <Tags>
              <Tag>{item.pt.toLocaleString()}pt</Tag>
              {isAfter(firstup, addMonths(new Date(), -1)) && (
                <Tag
                  color="red"
                  light={isAfter(firstup, addDays(new Date(), -7))}
                >
                  New!
                </Tag>
              )}
            </Tags>
          </Typography>
          <Typography color="textSecondary">
            <ItemBadge item={item} />
            {!isR18 && (
              <Link component={RouterLink} to={`/custom?genres=${item.genre}`}>
                {Genre.get(item.genre)}
              </Link>
            )}
            {isR18 && (
              <Link component={RouterLink} to={`/r18?site=${item.nocgenre}`}>
                {R18SiteNotation[item.nocgenre]}
              </Link>
            )}
            <Tag>
              {Math.round(item.length / item.general_all_no).toLocaleString()}
              文字/話
            </Tag>
          </Typography>
          <Typography variant="h5" component="h2" className={styles.title}>
            <Link
              color="textPrimary"
              component={RouterLink}
              to={detail}
              title={entities.decode(item.title)}
            >
              {entities.decode(item.title)}
            </Link>
          </Typography>
          <Typography color="textSecondary">
            作者:{" "}
            {isR18 ? (
              entities.decode(item.writer)
            ) : (
              <Link
                component={OutboundLink}
                eventLabel="RankingItem-User"
                to={user}
                target="_blank"
                rel="noopener noreferrer"
              >
                {entities.decode(item.writer)}
              </Link>
            )}
          </Typography>
          <Typography color="textSecondary">
            更新日時: {item.novelupdated_at}
          </Typography>
          <Typography color="textSecondary">
            掲載開始:{" "}
            {formatDistance(
              parse(item.general_firstup),
              baseDate,
              formatOptions
            )}
            前 / 最終更新:{" "}
            {formatDistance(
              parse(item.general_lastup),
              baseDate,
              formatOptions
            )}
            前
          </Typography>
          <Paper className={styles.keywords} variant="outlined">
            {item.keyword
              .split(/\s/g)
              .filter((keyword) => keyword)
              .map((keyword, i) => (
                <Chip
                  key={i}
                  component={RouterLink}
                  to={
                    isR18
                      ? `/r18?keyword=${keyword}`
                      : `/custom?keyword=${keyword}`
                  }
                  label={keyword}
                />
              ))}
          </Paper>
        </CardContent>
        <Collapse in={openStory}>
          <StoryRender className={styles.story} story={item.story} />
        </Collapse>
        <CardActions className={styles.actions}>
          <Button onClick={toggleStory}>
            あらすじを{openStory ? "隠す" : "表示"}
          </Button>
          <div className={styles.flexGap} />
          <Link component={RouterLink} to={detail}>
            小説情報
          </Link>
          <Button
            variant="contained"
            component={OutboundLink}
            eventLabel="RankingItem-read"
            to={link}
            target="_blank"
            rel="noopener noreferrer"
            title={entities.decode(item.title)}
          >
            読む
          </Button>
        </CardActions>
      </Card>
    );
  },
  (prev, next) =>
    prev.item.ncode === next.item.ncode &&
    prev.item.rank === next.item.rank &&
    prev.item.pt === next.item.pt
);

export default RankingItem;
