import "./App.css";
import Header from "./components/header/header";
import Home from "./components/home/home";
import Projects from "./components/projects/projects";
import Demos from "./components/demos/demos";
import SkiMap from "./components/ski-map/ski-map";
import OceanTracking from "./components/ocean-tracking/ocean-tracking";
import Stocks from "./components/stocks/stocks";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <div className="app">
      <BrowserRouter forceRefresh={true}>
        <Routes>
          <Route path="/" element={<Header />}>
            <Route path="home" element={<Home />} />
            <Route path="projects" element={<Projects />} />
            <Route path="demos" element={<Demos />} />
            <Route path="ski-map" element={<SkiMap />} />
            <Route path="ocn-tracking" element={<OceanTracking />} />
            <Route path="stocks/*" element={<Stocks />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
