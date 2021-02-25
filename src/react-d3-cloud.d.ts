declare module "react-d3-cloud" {
  type D3CloudData = { text: string; value: number };
  type Mapper<T> = (word: string, idx: number) => T;
  type EventHandler = (word: string) => {};
  type ReactD3CloudProps = {
    data: D3CloudData[];
    width?: number;
    height?: number;
    fontSizeMapper?: Mapper<number>;
    rotate?: number | Mapper<number>;
    padding?: number | Mapper<number>;
    font?: string | Mapper<string>;
    onWordClick?: EventHandler;
    onWordMouseOver?: EventHandler;
    onWordMouseOut?: EventHandler;
  };

  export default class WordCloud extends React.Component<ReactD3CloudProps> {}
}
