import { Card } from "@blueprintjs/core";
import "./home.css";
import me from "./tom.jpeg";
import React from "react";

const Home = () => {
  return (
    <div className="home-page-wrapper">
      <div className="card">
        <Card elevation={3}>
          <div className="card-main">
            <div className="card-content">
              <p>
                {" "}
                I am a student at King&apos;s College London currently studying
                for an MSc in Artificial Intelligence.
              </p>
              <p>
                This site is designed to house a collection of recently
                completed side projects and showcase several other pieces of
                work undertaken throughout my studies.
              </p>
              <p>
                I try to update this website as regularly as possible, the
                changelog below should give a good indication of what has been
                added recently.
              </p>
            </div>
            <img src={me} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
