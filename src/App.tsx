import React from "react";
import "bulma";
import "react-datepicker/dist/react-datepicker.css";
import { Header } from "./components/common/Header";
import { Footer } from "./components/common/Footer";
import Ranking from "./pages/ranking";

const App: React.FC = () => {
  return (
    <div className="App">
      <Header></Header>
      <Ranking></Ranking>
      <Footer></Footer>
    </div>
  );
};

export default App;
