import React, { useState, useCallback } from "react";
import { Link, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";

const validateRegexp = /[nN][0-9]{4}[a-zA-Z]{2}/

function validate(ncode: string): boolean {
  return validateRegexp.test(ncode)
}

export const Header: React.FC = () => {
  const [expand, setExpand] = useState(false);
  const [ncode, setNcode] = useState("");
  const history = useHistory();
  const toggle = useCallback(() => setExpand(!expand), [expand]);
  const detail = useCallback(() => {
    history.push(`/detail/${ncode}`);
  }, [history, ncode]);
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link className="navbar-item" to="/">
          <FontAwesomeIcon icon={faTrophy} />
          なろうランキング
        </Link>

        <span className="navbar-burger burger" onClick={toggle}>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </span>
      </div>

      <div className={`navbar-menu ${expand ? "is-active" : ""}`}>
        <div className="navbar-start">
          <Link className="navbar-item" to="/ranking/d">
            日間
          </Link>
          <Link className="navbar-item" to="/ranking/w">
            週間
          </Link>
          <Link className="navbar-item" to="/ranking/m">
            月間
          </Link>
          <Link className="navbar-item" to="/custom">
            カスタムランキング
          </Link>
        </div>
        <div className="navbar-end">
          <div className="navvar-item field has-addons">
            <div className="control">
              <input className="input" type="text" placeholder="Nコード" onChange={e => setNcode(e.target.value)} />
            </div>
            <div className="control">
              <button className="button" disabled={!validate(ncode)} onClick={detail}>詳細を取得</button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
