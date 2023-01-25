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
              <p>
                I do have another website, it is quite old but can be found at{" "}
                <a href="https://tp665.github.io/">tp665.github.io</a>. Contact
                information on the site is out of date.
              </p>
            </div>
            <img src={me} />
          </div>
        </Card>
        <div className="changelog">
          <h3>Changelog</h3>
          <ul>
            <li>
              January 2023 - Added a demo of a TypeScript-based DL package I
              developed a while back. You can create a simple neural net and
              choose which dataset/features you would like to play with. The
              decision boundary visualiser is often more interpretable than the
              raw loss values and helps to identify the model&apos;s flaws.
            </li>
            <br />
            <li>
              September 2022 - Initial version. Added MLP, Stocks and Regex
              Helper sections. Unfortunately, Regex Helper needs to be disabled
              until further notice (see page for more details).
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
