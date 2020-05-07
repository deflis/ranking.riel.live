import React, { useEffect } from "react";
import "bulma";
import "react-datepicker/dist/react-datepicker.css";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import Ranking from "./pages/ranking";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import ErrorBoundary from "./components/common/ErrorBoundary";
import Detail from "./pages/detail";
import CustomRanking from "./pages/custom";
import ReactGA from "react-ga";

const withTracker: (WrappedComponent: React.FC) => React.FC = (
  WrappedComponent
) => {
  return (props) => {
    const history = useHistory();

    useEffect(() => {
      return history.listen((location) => {
        const page = location.pathname || window.location.pathname;
        const search = location.search || window.location.search;
        ReactGA.set({ page: page });
        ReactGA.pageview(page + search);
      });
    }, [history]);

    return <WrappedComponent {...props} />;
  };
};

const App: React.FC = () => {
  ReactGA.initialize("UA-131756790-5");
  ReactGA.pageview(window.location.pathname + window.location.search);

  return (
    <Router>
      <div className="App">
        <Header />
        <ErrorBoundary>
          <Switch>
            <Route
              path={["/", "/ranking/:type", "/ranking/:type/:date"]}
              exact
              component={withTracker(Ranking)}
            />
            <Route
              path="/detail/:ncode"
              exact
              component={withTracker(Detail)}
            />
            <Route
              path="/custom"
              exact
              component={withTracker(CustomRanking)}
            />
            <Route
              path="/custom/:type"
              exact
              component={withTracker(CustomRanking)}
            />
          </Switch>
        </ErrorBoundary>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
