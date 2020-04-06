import React, { useState, useCallback, useEffect } from "react";
import Genre from '../../enum/Genre';

export interface CustomRankingFormEvent {
  keyword?: string;
  genres: number[];
}
export interface CustomRankingFormParams {
  keyword?: string;
  genres: number[];
  onSearch: (e: CustomRankingFormEvent) => void;
}

export const CustomRankingForm: React.FC<CustomRankingFormParams> = ({
  keyword: defaultKeyword,
  genres: defaultGenres,
  onSearch,
}) => {
  const [keyword, setKeyword] = useState(defaultKeyword);
  const [genres, setGenres] = useState<number[]>(defaultGenres);

  useEffect(() => {
    setKeyword(defaultKeyword);
  }, [defaultKeyword]);

  useEffect(() => {
    setGenres(defaultGenres);
  }, [defaultGenres]);

  const genreFilter = Array.from(Genre).map(([id, name]) => {
    const genreChange = () => {
      if (genres.includes(id)) {
        setGenres(genres.filter(x => x !== id));
      } else {
        setGenres([id].concat(genres));
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
      onSearch({ keyword, genres });
    },
    [onSearch, keyword, genres]
  );

  const handleChangeKeyword = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value);
    },
    []
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="field is-horizontal">
        <div className="field-label">
          <label className="label">キーワード</label>
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
        <div className="field-label"><label className="label">ジャンル</label></div>
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
        </div>
      </div>
    </form>
  );
};
