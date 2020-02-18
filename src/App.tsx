import React from "react";
import "bulma";
import "react-datepicker/dist/react-datepicker.css";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import Ranking from "./pages/ranking";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header></Header>
        <Switch>
          <Route path="/" exact>
            <Ranking></Ranking>
          </Route>
          <Route path="/ranking/:type" exact>
            <Ranking></Ranking>
          </Route>
          <Route path="/ranking/:type/:date" exact>
            <Ranking></Ranking>
          </Route>
        </Switch>
        <Footer></Footer>
      </div>
    </Router>
  );
};

export default App;
