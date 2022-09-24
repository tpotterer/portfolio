import "./App.css";
import Header from "./components/header/header";
import Home from "./components/home/home";
import Stocks from "./components/stocks/stocks";
import Gpt from "./components/gpt/gpt";
import AutoGrad from "./components/auto-grad/auto-grad";
import { Routes, Route, HashRouter } from "react-router-dom";
import React from "react";

const App = () => {
  return (
    <div className="app">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Header />}>
            <Route path="" element={<Home />} />
            <Route path="mlp/*" element={<AutoGrad />} />
            <Route path="regex/*" element={<Gpt />} />
            <Route path="stocks/*" element={<Stocks />} />
            <Route path="*" element={<div>not found</div>} />
          </Route>
        </Routes>
      </HashRouter>
    </div>
  );
};

export default App;
