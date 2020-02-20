import React from "react";
import "bulma";
import "react-datepicker/dist/react-datepicker.css";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import Ranking from "./pages/ranking";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import ErrorBoundary from './components/common/ErrorBoundary';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Header></Header>
        <Switch>
          <Route path={["/", "/ranking/:type", "/ranking/:type/:date"]} exact>
            <ErrorBoundary>
              <Ranking></Ranking>
            </ErrorBoundary>
          </Route>
        </Switch>
        <Footer></Footer>
      </div>
    </Router>
  );
};

export default App;
