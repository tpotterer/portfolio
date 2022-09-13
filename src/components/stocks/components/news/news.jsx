import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { formatDistance } from "date-fns";
import { BASE_URL, headers } from "../../stocks";
import { Classes } from "@blueprintjs/core";
import { useNavigate } from "react-router-dom";

import * as sentiment from "sentiment";

const News = ({ symbols }) => {
  const [stocks] = useState(symbols);
  const [newsLoading, setNewsLoading] = useState(true);

  const navigate = useNavigate();

  // instantiate with dummy article to give skeleton something to render
  const [news, setNews] = useState([
    {
      headline: "dummy",
      id: "",
      author: "",
      url: "",
      symbols: [],
      updated_at: "2020-01",
    },
  ]);

  const sentimentAnalyser = new sentiment();

  useEffect(() => {
    fetch(
      `${BASE_URL}/v1beta1/news${
        symbols && symbols.length ? `?symbols=${symbols.join(",")}` : ""
      }`,
      { method: "GET", headers }
    )
      .then((res) => res.json())
      .then((res) => setNews(res.news))
      .then(setNewsLoading(false));
  }, [stocks]);

  return (
    <div>
      <h2>News</h2>
      {news.map((article) => {
        const sentimentResult = sentimentAnalyser.analyze(
          article.headline
        ).comparative;
        const loading = article.headline === "dummy";
        return (
          <div key={article.id}>
            <div
              className={loading || newsLoading ? Classes.SKELETON : undefined}
            >
              <h4>{article.headline}</h4>
              <p>
                Sentiment:{" "}
                {sentimentResult > 0 ? (
                  <span style={{ color: "green" }}>Positive</span>
                ) : sentimentResult < 0 ? (
                  <span style={{ color: "red" }}>Negative</span>
                ) : (
                  "Neutral"
                )}
              </p>
            </div>
            <div
              className={loading || newsLoading ? Classes.SKELETON : undefined}
            >
              <p>
                {article.author} -{" "}
                <a href={article.url} target="_blank" rel="noreferrer">
                  {article.url}
                </a>
              </p>
              <p>
                {article.symbols.map((elem, idx) => (
                  <a
                    onClick={() => {
                      navigate(`/stocks/view/${elem}`);
                      window.location.reload();
                    }}
                    key={`${article.headline}-${idx}`}
                  >
                    {elem}
                    {idx < article.symbols.length - 1 && ", "}
                  </a>
                ))}
              </p>
              <p>
                Updated{" "}
                {formatDistance(new Date(article.updated_at), new Date(), {
                  addSuffix: true,
                })}
                .
              </p>
            </div>
            <div className="stock-nav-divider"></div>
          </div>
        );
      })}
    </div>
  );
};

News.propTypes = {
  symbols: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default News;
