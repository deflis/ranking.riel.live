import React, { useState, useCallback, useEffect } from "react";
import Genre from "../../enum/Genre";
import CustomRanking from "../../pages/custom";

export enum RankingType {
  Daily = "d",
  Weekly = "w",
  Monthly = "m",
  Quarter = "q",
  Yearly = "y",
  All = "a"
}

const RankingTypeName = new Map([
  [RankingType.Daily, "日間"],
  [RankingType.Weekly, "週間"],
  [RankingType.Monthly, "月間"],
  [RankingType.Quarter, "四半期"],
  [RankingType.Yearly, "年間"],
  [RankingType.All, "全期間"]
]);

export interface CustomRankingFormEvent {
  keyword?: string;
  genres: number[];
  rankingType: RankingType;
}

export interface CustomRankingFormParams {
  keyword?: string;
  genres: number[];
  rankingType: RankingType;
  onSearch: (e: CustomRankingFormEvent) => void;
}

interface InnterParams {
  toggleShow: () => void;
}

export const CustomRankingForm: React.FC<CustomRankingFormParams> = params => {
  const [show, setShow] = useState(false);
  const toggleShow = useCallback(() => setShow(!show), [show]);

  if (show) {
    return <EnableCustomRankingForm {...params} toggleShow={toggleShow} />;
  } else {
    return <DisableCustomRankingForm {...params} toggleShow={toggleShow} />;
  }
};

const DisableCustomRankingForm: React.FC<CustomRankingFormParams &
  InnterParams> = ({ keyword, genres, rankingType, onSearch, toggleShow }) => {
  const genre =
    genres.length > 0
      ? genres
          .map(genre => <span className="tag">{Genre.get(genre)}</span>)
          .reduce(
            (previous, current) => (
              <>
                {previous} {current}
              </>
            ),
            <>ジャンル: </>
          )
      : "ジャンル設定なし";
  return (
    <>
      <section className="hero">
        <div className="hero-body">
          <div className="container">
            <h1 className="title">
              {keyword ? `${keyword}の` : "カスタム"}
              {RankingTypeName.get(rankingType)}ランキング
            </h1>
            <h2 className="subtitle">{genre}</h2>
          </div>
        </div>
        <div className="hero-foot">
          <nav className="navbar">
            <div className="container">
              <div className="navbar-menu">
                <div className="navbar-start">
                  <button className="button" onClick={toggleShow}>
                    編集
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </section>
    </>
  );
};

const RankingTypeOptions = Array.from(
  RankingTypeName.entries()
).map(([value, label]) => <option value={value}>{label}</option>);

const EnableCustomRankingForm: React.FC<CustomRankingFormParams &
  InnterParams> = ({
  keyword: defaultKeyword,
  genres: defaultGenres,
  rankingType: defaultType,
  onSearch,
  toggleShow
}) => {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [genres, setGenres] = useState<number[]>(defaultGenres);
  const [rankingType, setRankingType] = useState<RankingType>(defaultType);

  useEffect(() => {
    setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  useEffect(() => {
    setGenres(defaultGenres);
  }, [defaultGenres]);

  useEffect(() => {
    setRankingType(defaultType);
  }, [defaultType]);

  const genreFilter = Array.from(Genre).map(([id, name]) => {
    const genreChange = () => {
      if (genres.includes(id)) {
        setGenres(genres.filter(x => x !== id));
      } else {
        setGenres([id].concat(genres).sort());
      }
    };
    return (
      <div
        className="column is-one-fifth-desktop is-half-mobile control"
        key={id}
      >
        <label className="checkbox">
          <input
            type="checkbox"
            checked={genres.includes(id)}
            onChange={genreChange}
          />
          {name}
        </label>
      </div>
    );
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSearch({ keyword, genres: genres, rankingType });
    },
    [onSearch, keyword, genres, rankingType]
  );

  const handleChangeKeyword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value);
    },
    []
  );

  const handleChangeType = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setRankingType(e.target.value as RankingType);
    },
    []
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">種類</label>
        </div>
        <div className="field-body">
          <div className="field has-addons">
            <div className="select">
              <select value={rankingType} onChange={handleChangeType}>
                {RankingTypeOptions}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">
            キーワード
            <br />
            (未入力時はすべて)
          </label>
        </div>
        <div className="field-body">
          <div className="field">
            <div className="control">
              <input
                type="text"
                className="input"
                value={keyword}
                onChange={handleChangeKeyword}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">
            ジャンル
            <br />
            (未選択時は全て)
          </label>
        </div>
        <div className="field-body">
          <div className="columns is-multiline">{genreFilter}</div>
        </div>
      </div>
      <div className="field is-horizontal">
        <div className="field-label"></div>
        <div className="field-body">
          <div className="control">
            <input type="submit" className="button is-primary" value="検索" />
          </div>
          <div className="control">
            <button className="button" onClick={toggleShow}>
              閉じる
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
