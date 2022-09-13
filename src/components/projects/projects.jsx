import * as math from "mathjs";
import "./projects.css";

// all defined near -1, 1
const targetFunction = (a, b, c) => a * a + 3 * b - c;

const Projects = () => {
  const layerShape = {
    input: 3,
    hidden: 3,
    output: 1,
  };

  const w_ih = math.matrix([
    [0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
    [0.5, 0.5, 0.5],
  ]);

  const w_ho = math.matrix([[0.5, 0.5, 0.5]]);

  const input = math.matrix([1, 1, 1]);
  const trueOutput = targetFunction(
    input._data[0],
    input._data[1],
    input._data[2]
  );
  const prediction = query(w_ih, w_ho, input)._data[0];

  const error = se(trueOutput, prediction);
  return (
    <div className="nn-wrapper">
      <h1>Projects</h1>
      <p>Want to learn the relationship</p>
      <p>Input: {layerShape.input}</p>
      <p>Hidden: {layerShape.hidden}</p>
      <p>Output: {layerShape.output}</p>

      <p>{prediction}</p>
      <p>{trueOutput}</p>
      <p>{error}</p>
    </div>
  );
};

const se = (trueOutput, prediction) => {
  return math.square(trueOutput - prediction);
};

const sigmoid = (x) => 1 / (1 + math.exp(-x));

const query = (w_ih, w_ho, input) => {
  const hidden_in = math.multiply(w_ih, input);
  const hidden_out = math.map(hidden_in, sigmoid);
  const output_in = math.multiply(w_ho, hidden_out);
  const output_out = math.map(output_in, sigmoid);
  return output_out;
};

export default Projects;
