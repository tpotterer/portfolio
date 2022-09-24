import React, { useRef, useState } from "react";
import "./auto-grad.css";
import * as d3 from "d3";

import {
  FormGroup,
  Slider,
  Button,
  Collapse,
  Alert,
  ControlGroup,
  NumericInput,
  Divider,
  Toaster,
  RadioGroup,
  Radio,
} from "@blueprintjs/core";
import { MLP } from "./mlp.class";
import { useEffect } from "react";
import { Neuron } from "./neuron.class";
import { Value } from "./value.class";

const toaster = Toaster.create({ position: "top" });

const AutoGrad = () => {
  const [modelInputN, setModelInputN] = React.useState(2);
  const [hiddenLayersN, setHiddenLayersN] = React.useState(3);
  const [hiddenLayerSize, setHiddenLayerSize] = React.useState(4);
  const [modelOutputN, setModelOutputN] = React.useState(2);
  const [showModelSetup, setShowModelSetup] = React.useState(true);

  const [model, setModel] = React.useState<MLP>();
  const [selectedNeuron, setSelectedNeuron] = React.useState<{
    neuron: Neuron;
    label: string;
  }>();

  const [x, setX] = React.useState<number[]>([]);
  const [y, setY] = React.useState<number[]>([]);

  const [xVals, setXVals] = React.useState<Value[]>([]);
  const [yVals, setYVals] = React.useState<Value[]>([]);

  const [learningRate, setLearningRate] = React.useState<number>(0.01);
  const [dropOut, setDropOut] = React.useState<number>(0.95);

  const [modelPreds, setModelPreds] = React.useState<Value[]>([]);

  useEffect(() => {
    if (!model) return;
    setXVals(x.map((elem) => new Value(elem)));
    setYVals(y.map((elem) => new Value(elem)));
  }, [model, x, y]);

  const [alertOpen, setAlertOpen] = React.useState<boolean>(false);

  const svgRef = useRef(null);

  let width = window.innerWidth;
  let height = 500;

  const [svgWidth, setWidth] = useState(width);
  const [svgHeight] = useState(height);

  const handleResize = () => {
    setWidth(window.innerWidth);
  };

  window.addEventListener("resize", handleResize);

  useEffect(() => {
    if (selectedNeuron) {
      setAlertOpen(true);
    }
  }, [selectedNeuron]);

  useEffect(() => {
    setX(
      new Array(modelInputN)
        .fill(0)
        .map((_, idx) => x[idx] || Math.round(Math.random() * 10) / 10)
    );
  }, [modelInputN]);

  useEffect(() => {
    setY(
      new Array(modelOutputN)
        .fill(0)
        .map((_, idx) => y[idx] || Math.round(Math.random() * 10) / 10)
    );
  }, [modelOutputN]);

  useEffect(() => {
    const hiddenLayers = new Array(hiddenLayersN).fill(hiddenLayerSize);
    setModelPreds([]);
    setModel(new MLP(modelInputN, [...hiddenLayers, modelOutputN]));
  }, [hiddenLayersN, hiddenLayerSize, modelInputN, modelOutputN]);

  useEffect(() => {
    if (!model) return;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove(); // Clear svg content before adding new elements
    const svg = svgEl.append("g");

    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "#f6f7f9");

    const layers = [
      new Array(modelInputN).fill(0),
      ...model.getLayers().map((layer) => layer.getNeurons()),
    ];

    const dropOutMasks = [
      false, // to line up indices with layers
      ...model.getLayers().map((layer) => layer.getDropOutMask()),
    ];

    const layerWidth = svgWidth / layers.length;
    for (let i = 1; i < layers.length; i++) {
      const neurons = layers[i];
      const layerDropOutMask = dropOutMasks[i];

      const neuronHeight = svgHeight / neurons.length;
      for (let j = 0; j < neurons.length; j++) {
        // not needed yet
        const neuronX = i * layerWidth + layerWidth / 2;
        const neuronY = j * neuronHeight + neuronHeight / 2;
        for (let k = 0; k < layers[i - 1].length; k++) {
          const prevLayerDropoutMask = dropOutMasks[i - 1];
          const prevNeuronX = (i - 1) * layerWidth + layerWidth / 2;
          const prevNeuronHeight = svgHeight / layers[i - 1].length;
          const prevNeuronY = k * prevNeuronHeight + prevNeuronHeight / 2;
          svg
            .append("line")
            .attr("x1", prevNeuronX)
            .attr("y1", prevNeuronY)
            .attr("x2", neuronX)
            .attr("y2", neuronY)
            .attr(
              "stroke",
              layerDropOutMask[j] ||
                (prevLayerDropoutMask && prevLayerDropoutMask[k])
                ? "red"
                : "darkgreen"
            )
            .attr("stroke-width", 2);
        }
      }
    }

    const labelToNeuron = new Map<String, Neuron>([]);

    for (let i = 0; i < layers.length; i++) {
      const neurons = layers[i];
      const neuronHeight = svgHeight / neurons.length;
      const layerDropOutMask = dropOutMasks[i];
      for (let j = 0; j < neurons.length; j++) {
        // not needed yet
        const neuron = neurons[j];
        const label = (() => {
          if (i === 0) return `in_${j}`;
          if (i === layers.length - 1) return `out_${j}`;
          return `h_${i}${j}`;
        })();
        labelToNeuron.set(label, neuron);
        const neuronX = i * layerWidth + layerWidth / 2;
        const neuronY = j * neuronHeight + neuronHeight / 2;
        const nodeColour = layerDropOutMask[j] ? "red" : "white";
        svg
          .append("circle")
          .attr("cx", neuronX)
          .attr("cy", neuronY)
          .attr("r", 8)
          .attr("fill", nodeColour)
          .attr("stroke", () => {
            if (i == 0) return "orange";
            if (i == layers.length - 1) return "green";
            return "blue";
          })
          .attr("stroke-width", 1)
          .on("mouseover", function (d) {
            d3.select(this)
              .style("fill", () => {
                if (i == 0) return "orange";
                if (i == layers.length - 1) return "green";
                return "blue";
              })
              .style("cursor", "pointer");
          })
          .on("mouseout", function (d) {
            d3.select(this)
              .style("fill", nodeColour)
              .style("cursor", "default");
          })
          .on("click", () => {
            const neuron = labelToNeuron.get(label);
            if (neuron) setSelectedNeuron({ neuron, label });
          });
        svg
          .append("text")
          .attr("x", neuronX)
          .attr("y", neuronY - 12)
          .attr("font-size", 10)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "bottom")
          .text(label);

        if (i === 0) {
          svg
            .append("text")
            .attr("x", neuronX - 15)
            .attr("y", neuronY)
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "middle")
            .text(`${x[j]} ->`);
        } else if (
          i === layers.length - 1 &&
          modelPreds.length === neurons.length
        ) {
          svg
            .append("text")
            .attr("x", neuronX + 15)
            .attr("y", neuronY)
            .attr("text-anchor", "start")
            .attr("dominant-baseline", "middle")
            .text(`-> ${modelPreds[j].data.toFixed(5)}`);
        }
      }
    }
  }, [model, svgWidth, svgHeight, modelPreds, xVals, yVals]);

  const takeSteps = (n: number) => {
    if (!model) return;

    let preds;

    for (let i = 0; i < n; i++) {
      preds = model.forward(xVals, dropOut);
      const outputLosses = preds.map((pred, idx) =>
        pred.sub(yVals[idx]).pow(2)
      );
      const loss = outputLosses
        .reduce((acc, curr) => acc.add(curr), new Value(0))
        .div(new Value(preds.length));

      model.params().forEach((param) => (param.grad = 0.0));
      loss.backward();
      model
        .params()
        .forEach((param) => (param.data += -learningRate * param.grad));
    }

    setModelPreds(preds);
    toaster.show({
      message: `${n} gradient descent steps taken with LR ${learningRate} and dropOut ${dropOut}. Call "forward" to view error.`,
      intent: "success",
      timeout: 3000,
    });
  };

  return (
    <>
      <Alert
        confirmButtonText="Okay"
        isOpen={alertOpen}
        canOutsideClickCancel={true}
        canEscapeKeyCancel={true}
        onClose={() => {
          setAlertOpen(false);
          setSelectedNeuron(undefined);
        }}
      >
        <div>
          <h3>Neuron: {selectedNeuron?.label}</h3>
          <p>Activation function: tanh</p>
          <p>Params: {selectedNeuron?.neuron.params().length}</p>
          <ul>
            {selectedNeuron?.neuron.params().map((param, i) => {
              if (i !== 0)
                return (
                  <li key={`param_list_${i}`}>
                    <h5>{`w_${i}`}</h5>
                    <p>Value: {param.data}</p>
                    <p>Current grad: {param.grad}</p>
                  </li>
                );
              return (
                <li key={`param_list_${i}`}>
                  {" "}
                  <h5>Bias</h5>
                  <p>Value: {param.data}</p>
                  <p>Current grad: {param.grad}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </Alert>
      <div className="auto-grad-page-wrapper">
        <div className="auto-grad-content-wrapper" id="auto-grad-content">
          <h2>MLP Builder</h2>
          <Button onClick={() => setShowModelSetup(!showModelSetup)}>
            {showModelSetup ? "Hide" : "Show"} MLP setup
          </Button>
          <Collapse isOpen={showModelSetup}>
            <FormGroup>
              <h4>Model input nodes:</h4>
              <Slider
                value={modelInputN}
                stepSize={1}
                min={1}
                max={5}
                onChange={setModelInputN}
              />
              <h4>Model hidden layers:</h4>
              <Slider
                value={hiddenLayersN}
                stepSize={1}
                min={0}
                max={5}
                onChange={setHiddenLayersN}
              />
              <h4>Model hidden layer size:</h4>
              <Slider
                value={hiddenLayerSize}
                stepSize={1}
                min={1}
                max={5}
                onChange={setHiddenLayerSize}
              />
              <h4>Model output nodes:</h4>
              <Slider
                value={modelOutputN}
                stepSize={1}
                min={1}
                max={5}
                onChange={setModelOutputN}
              />
              <h4>Build 1 training sample:</h4>
              <p>For best results keep values between -1 and 1.</p>
              <ControlGroup>
                <FormGroup>
                  {x.map((val, idx) => (
                    <div key={`samples_${idx}`}>
                      <h5>Input @ {`in_${idx}`}:</h5>
                      <NumericInput
                        min={-1}
                        max={1}
                        stepSize={0.1}
                        value={val}
                        onValueChange={(val) => {
                          const newX = [...x];
                          newX[idx] = Math.min(Math.max(val, -1), 1);
                          setX(newX);
                        }}
                      />
                    </div>
                  ))}
                </FormGroup>
                <FormGroup>
                  {y.map((val, idx) => (
                    <div key={`samples_out_${idx}`}>
                      <h5>Target @ {`out_${idx}`}:</h5>
                      <NumericInput
                        min={-1}
                        max={1}
                        stepSize={0.1}
                        value={val}
                        onValueChange={(val) => {
                          const newY = [...y];
                          newY[idx] = Math.min(Math.max(val, -1), 1);
                          setY(newY);
                        }}
                      />
                    </div>
                  ))}
                </FormGroup>
              </ControlGroup>
              <h4>Your function:</h4>
              <h5>
                f([{x.join(", ")}]) = [{y.join(", ")}]
              </h5>
            </FormGroup>
          </Collapse>
        </div>
        <Divider />
        {model && (
          <div className="auto-grad-diagram">
            <div className="auto-grad-diagram-controls">
              <h3>Model controls:</h3>
              <p>
                You may now use and train your model. Click on a node to view
                gradients, incoming edge weights and more. Any changes to the
                above model config will reset all values and gradients. The
                50,000 step training option may take two or three seconds. Large
                networks or those with lots of dropOut may struggle to converge.
              </p>
              <FormGroup>
                <ControlGroup>
                  <Button
                    intent={"primary"}
                    onClick={() => {
                      const preds = model.forward(xVals);
                      const outputLosses = preds.map((pred, idx) =>
                        pred.sub(yVals[idx]).pow(2)
                      );
                      const loss = outputLosses
                        .reduce((acc, curr) => acc.add(curr), new Value(0))
                        .div(new Value(preds.length));
                      setModelPreds(preds);
                      toaster.show({
                        message: `Forward pass complete. MSE: ${loss.data.toFixed(
                          5
                        )}`,
                        intent: "success",
                        timeout: 3000,
                      });
                    }}
                  >
                    Forward
                  </Button>
                  <Button
                    intent={"primary"}
                    onClick={() => {
                      const preds = model.forward(xVals);
                      setModelPreds(preds);
                      const outputLosses = preds.map((pred, idx) =>
                        pred.sub(yVals[idx]).pow(2)
                      );
                      const loss = outputLosses.reduce(
                        (acc, curr) => acc.add(curr),
                        new Value(0)
                      );
                      loss.backward();
                      toaster.show({
                        message:
                          "Gradients propogated backwards, click on nodes to view.",
                        intent: "success",
                        timeout: 3000,
                      });
                    }}
                  >
                    Backward
                  </Button>
                </ControlGroup>
                <h4>Train:</h4>
                <ControlGroup>
                  <Button intent={"primary"} onClick={() => takeSteps(1)}>
                    1 step
                  </Button>
                  <Button intent={"primary"} onClick={() => takeSteps(50)}>
                    50 steps
                  </Button>
                  <Button intent={"primary"} onClick={() => takeSteps(1000)}>
                    1,000 steps
                  </Button>
                  <Button intent={"primary"} onClick={() => takeSteps(50000)}>
                    50,000 steps
                  </Button>
                </ControlGroup>
                <ControlGroup>
                  <div className="auto-grad-model-train-options">
                    <h5>Learning rate:</h5>
                    <RadioGroup
                      name="learning_rate_group"
                      onChange={(event) =>
                        setLearningRate(parseFloat((event as any).target.value))
                      }
                      selectedValue={learningRate}
                    >
                      <Radio label="0.001" value={0.001} />
                      <Radio label="0.01" value={0.01} />
                      <Radio label="0.1" value={0.1} />
                    </RadioGroup>
                  </div>
                  <div className="auto-grad-model-train-options">
                    <h5>Loss function:</h5>
                    <RadioGroup
                      name="loss_function_group"
                      onChange={() => {}}
                      selectedValue={"MSE"}
                    >
                      <Radio label="MSE" value="MSE" />
                    </RadioGroup>
                  </div>
                  <div className="auto-grad-model-train-options">
                    <h5>Dropout:</h5>
                    <p>P of hidden node staying active</p>
                    <NumericInput
                      min={0}
                      max={1}
                      stepSize={0.1}
                      value={dropOut}
                      onValueChange={(val) =>
                        setDropOut(Math.min(Math.max(val, 0), 1))
                      }
                    />
                  </div>
                </ControlGroup>
              </FormGroup>
            </div>
            <svg ref={svgRef} width={svgWidth} height={svgHeight} />
          </div>
        )}
      </div>
    </>
  );
};
export default AutoGrad;
