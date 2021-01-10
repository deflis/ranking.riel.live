import React, { useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import ReactGA from "react-ga";
import { makeStyles, Container, LinearProgress } from "@material-ui/core";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import MyThemeProvider from "./util/theme";
import GlobalStateProvider from "./util/globalState";

const Ranking = lazy(() => import("./pages/ranking"));
const Detail = lazy(() => import("./pages/detail"));
const CustomRanking = lazy(() => import("./pages/custom"));
const About = lazy(() => import("./pages/about"));

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  },
  main: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: "auto",
    backgroundColor:
      theme.palette.type === "light"
        ? theme.palette.grey[200]
        : theme.palette.grey[800],
  },
}));

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
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Router>
        <Header />
        <div className={styles.main}>
          <Container maxWidth="lg">
            <ErrorBoundary>
              <Suspense fallback={<LinearProgress />}>
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
                  <Route path="/about" exact component={withTracker(About)} />
                </Switch>
              </Suspense>
            </ErrorBoundary>
          </Container>
        </div>
        <Footer className={styles.footer} />
      </Router>
    </div>
  );
};

const WrappedApp: React.FC = () => {
  ReactGA.initialize("UA-131756790-5");
  ReactGA.pageview(window.location.pathname + window.location.search);

  return (
    <GlobalStateProvider>
      <MyThemeProvider>
        <App />
      </MyThemeProvider>
    </GlobalStateProvider>
  );
};

export default WrappedApp;
