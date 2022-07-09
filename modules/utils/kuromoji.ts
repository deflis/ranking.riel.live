import Kuromoji from "kuromoji";
import { Genre, RankingResult } from "narou";
import { promisify } from "util";

const DIC_URL = "/dict";
const TARGET_POS = ["名詞", "動詞", "形容詞"];
const NO_CONTENT = "*";

const builder = Kuromoji.builder({ dicPath: DIC_URL });
const build = promisify(builder.build.bind(builder));

let tokenizer:
  | Kuromoji.Tokenizer<Kuromoji.IpadicFeatures>
  | undefined = undefined;
const getTokenizer: typeof build = async () => {
  if (tokenizer === undefined) {
    return (tokenizer = await build());
  }
  return tokenizer;
};

const tokenize = (
  tokenizer: Kuromoji.Tokenizer<Kuromoji.IpadicFeatures>,
  title: string
): string[] => {
  return tokenizer
    .tokenize(title)
    .filter(({ pos }) => TARGET_POS.includes(pos))
    .map(({ basic_form, surface_form }) =>
      basic_form !== NO_CONTENT ? basic_form : surface_form
    );
};

export const reducerForMap = <T, K, V>(
  fnKey: (value: T) => K,
  fnValue: (reduceValue: V | undefined, nextValue: T) => V
): ((map: Map<K, V>, value: T) => Map<K, V>) => (map, value) =>
  map.set(fnKey(value), fnValue(map.get(fnKey(value)), value));

export const tokenizeTitle = async (ranking: RankingResult[]) => {
  const tokenizer = await getTokenizer();
  const tokens = await Promise.all(
    ranking
      .filter(({ title }) => title)
      .map<Promise<[Genre, string[]]>>(async ({ genre, title }) => [
        genre,
        await tokenize(tokenizer, title),
      ])
  );
  const tokenMap = tokens
    .flatMap(([genre, words]) =>
      words.map<[number, string]>((word) => [genre, word])
    )
    .reduce(
      reducerForMap<[Genre, string], Genre, string[]>(
        ([genre]) => genre,
        (array, [, word]) => (array ? [...array, word] : [word])
      ),
      new Map<Genre, string[]>()
    );
  const wordsGenreMap = Array.from(tokenMap.entries()).map<
    [Genre, Map<string, number>]
  >(([genre, words]) => [
    genre,
    words.reduce(
      reducerForMap<string, string, number>(
        (word) => word,
        (count) => (count ?? 0) + 1
      ),
      new Map<string, number>()
    ),
  ]);
  return wordsGenreMap;
};
