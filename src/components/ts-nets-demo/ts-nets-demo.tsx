import "./ts-nets-demo.css";
import React from "react";
import {
  AnyLayerType,
  Atom,
  LayerTypes,
  LinearLayer,
  Model,
  Neuron,
  NonLinearityLayer,
  NonLinearityTypes,
} from "ts-nets";
import {
  NumericInput,
  ControlGroup,
  FormGroup,
  Label,
  Button,
  MenuItem,
  Toaster,
  Checkbox,
} from "@blueprintjs/core";
import { ItemRenderer, Select2 } from "@blueprintjs/select";
import { useEffect } from "react";
import * as d3 from "d3";
import * as shuffle from "shuffle-array";

const toaster = Toaster.create({ position: "top" });

enum DatasetTypes {
  OR = "OR",
  XOR = "XOR",
  Circles = "CIRCLES",
  Cross = "CROSS",
}

const TsNetsDemo = () => {
  const defaultHiddenLayerSize = 3;
  const defaultNonLinearityType = NonLinearityTypes.Tanh;
  const dimensions = 200;

  const [featureMask, setFeatureMask] = React.useState<Boolean[]>([
    true,
    true,
    false,
    false,
    false,
    false,
  ]);
  const [featureList] = React.useState([
    <b key="feature_x">x</b>,
    <b key="feature_y">y</b>,
    <b key="feature_x2">
      x<sup>2</sup>
    </b>,
    <b key="feature_y2">
      y<sup>2</sup>
    </b>,
    <b key="feature_sinx">sin(x)</b>,
    <b key="feature_siny">sin(y)</b>,
  ]);
  const [hiddenLayersN, setHiddenLayersN] = React.useState<number>(2);
  const [hiddenLayerSizes, setHiddenLayerSizes] = React.useState<number[]>(
    Array(hiddenLayersN).fill(defaultHiddenLayerSize)
  );
  const [hiddenLayerActivations, setHiddenLayerActivations] = React.useState<
    NonLinearityTypes[]
  >(Array(hiddenLayersN).fill(defaultNonLinearityType));
  //   shouldn't change as we are classifying
  const [modelOutputN] = React.useState<number>(1);

  const [modelParamSizes, setModelParamSizes] = React.useState<number[]>([]);
  const [model, setModel] = React.useState<Model | null>(null);

  // data setup
  const [nData] = React.useState<number>(350);
  const [data, setData] = React.useState<{
    class1: Atom[][];
    class2: Atom[][];
  } | null>(null);
  const [boundaryType, setBoundaryType] = React.useState<string>(
    DatasetTypes.OR
  );

  // learning setup
  const [learningRate, setLearningRate] = React.useState<number>(0.1);
  const [modelPreds, setModelPreds] = React.useState<Array<{
    point: Atom[];
    pred: number;
  }> | null>(null);

  // SVG setup
  const svgRef = React.useRef(null);
  let width = window.innerWidth;
  let height = 800;
  const [svgWidth, setWidth] = React.useState(width);
  const [svgHeight] = React.useState(height);

  // resize listener and handler
  const handleResize = () => {
    setWidth(window.innerWidth);
  };
  window.addEventListener("resize", handleResize);

  useEffect(() => {
    const newData = new Array(nData)
      .fill(0)
      .map((_) => [
        new Atom(Math.random() * 10 - 5),
        new Atom(Math.random() * 10 - 5),
      ]);

    const allFeatures = newData.map(([x, y]) => [
      x,
      y,
      new Atom(x.value * x.value),
      new Atom(y.value * y.value),
      new Atom(Math.sin(x.value)),
      new Atom(Math.sin(y.value)),
    ]);
    if (boundaryType === DatasetTypes.OR) {
      setData({
        class1: allFeatures.filter(([x, y]) => x.value < 0 && y.value < 0),
        class2: allFeatures.filter(([x, y]) => !(x.value < 0 && y.value < 0)),
      });
    } else if (boundaryType === DatasetTypes.XOR) {
      setData({
        class1: allFeatures.filter(
          ([x, y]) =>
            (x.value < 0 && y.value < 0) || (x.value > 0 && y.value > 0)
        ),
        class2: allFeatures.filter(
          ([x, y]) =>
            !((x.value < 0 && y.value < 0) || (x.value > 0 && y.value > 0))
        ),
      });
    } else if (boundaryType === DatasetTypes.Circles) {
      setData({
        class1: allFeatures.filter(
          ([x, y]) => x.value * x.value + y.value * y.value < 2.5 * 2.5
        ),
        class2: allFeatures.filter(
          ([x, y]) => !(x.value * x.value + y.value * y.value < 2.5 * 2.5)
        ),
      });
    } else if (boundaryType === DatasetTypes.Cross) {
      setData({
        class1: allFeatures.filter(
          ([x, y]) => Math.abs(x.value) < 1 || Math.abs(y.value) < 1
        ),
        class2: allFeatures.filter(
          ([x, y]) => !(Math.abs(x.value) < 1 || Math.abs(y.value) < 1)
        ),
      });
    }
  }, [nData, boundaryType]);

  // updates size of hidden layers
  useEffect(() => {
    if (
      hiddenLayerSizes.length === hiddenLayersN &&
      hiddenLayerActivations.length === hiddenLayersN
    )
      return;

    if (hiddenLayerSizes.length > hiddenLayersN) {
      setHiddenLayerSizes(hiddenLayerSizes.slice(0, hiddenLayersN));
    } else {
      setHiddenLayerSizes([
        ...hiddenLayerSizes,
        ...Array(hiddenLayersN - hiddenLayerSizes.length).fill(
          defaultHiddenLayerSize
        ),
      ]);
    }

    if (hiddenLayerActivations.length > hiddenLayersN) {
      setHiddenLayerActivations(hiddenLayerActivations.slice(0, hiddenLayersN));
    } else {
      setHiddenLayerActivations([
        ...hiddenLayerActivations,
        ...Array(hiddenLayersN - hiddenLayerActivations.length).fill(
          defaultNonLinearityType
        ),
      ]);
    }
  }, [hiddenLayersN]);

  // updates modelParamSizes when featureMask or hiddenLayerSizes or modelOutputN changes
  useEffect(() => {
    setModelParamSizes([
      featureMask.filter((elem) => !!elem).length,
      ...hiddenLayerSizes,
      modelOutputN,
    ]);
  }, [featureMask, hiddenLayerSizes, modelOutputN]);

  // updates model when parameter specification changes
  useEffect(() => {
    if (!modelParamSizes.length) return;
    setModel(
      new Model(
        modelParamSizes.reduce((prev, currSize, i) => {
          return i !== modelParamSizes.length - 1
            ? [
                ...prev,
                new LinearLayer(currSize, modelParamSizes[i + 1]),
                ...(i !== modelParamSizes.length - 2 &&
                hiddenLayerActivations[i] !== NonLinearityTypes.None
                  ? [new NonLinearityLayer(hiddenLayerActivations[i])]
                  : []),
              ]
            : prev;
        }, [] as AnyLayerType[])
      )
    );
    setModelPreds(null);
  }, [modelParamSizes, hiddenLayerActivations]);

  const trainModel = (epochs: number) => {
    if (!data?.class1?.length || !model || !data?.class2?.length) return;
    const trainingData = [
      ...data.class1.map((point) => ({
        input: point.filter((_, i) => featureMask[i]),
        outputs: new Atom(-1),
      })),
      ...data.class2.map((point) => ({
        input: point.filter((_, i) => featureMask[i]),
        outputs: new Atom(1),
      })),
    ];

    const allLosses = new Array(epochs).fill(0).reduce((prev) => {
      const epochData = shuffle(trainingData);

      const xs = epochData.map((elem) => elem.input);
      const ys = epochData.map((elem) => elem.outputs);
      const ypreds = xs.map((elem) => model.forward(elem)[0] as Atom);

      const outputLosses = ypreds.map((pred, idx) => pred.sub(ys[idx]).pow(2));

      const loss = outputLosses
        .reduce((acc, curr) => acc.add(curr), new Atom(0))
        .div(new Atom(ypreds.length));

      model.getParameters().forEach((param) => (param.grad = 0.0));
      loss.backward();
      model
        .getParameters()
        .forEach((param) => (param.value += -learningRate * param.grad));

      return [...prev, loss.value];
    }, []);

    toaster.show({
      message: `Trained for ${epochs} epochs. MSE: ${allLosses[
        allLosses.length - 1
      ].toFixed(5)}`,
      intent: "success",
      timeout: 3000,
    });
  };

  useEffect(() => {
    if (!model || !data?.class1?.length || !data?.class2?.length) return;

    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll("*").remove();
    const svg = svgEl.append("g");

    svg
      .append("rect")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("fill", "#f6f7f9");

    const neuronLayers = [
      new Array(featureMask.filter((elem) => !!elem).length).fill(0),
      ...model.getLayers().reduce((prev, currLayer) => {
        if (currLayer.layerType !== LayerTypes.Linear) {
          return prev;
        }
        const currNeurons = (currLayer as LinearLayer).getNeurons();
        return [...prev, currNeurons];
      }, [] as Neuron[][]),
    ];

    const modelDiagramWidth = svgWidth - 400;

    // draw neurons
    const layerWidth = modelDiagramWidth / neuronLayers.length;
    for (let i = 1; i < neuronLayers.length; i++) {
      const neurons = neuronLayers[i];

      const neuronHeight = svgHeight / neurons.length;

      for (let j = 0; j < neurons.length; j++) {
        const neuronX = i * layerWidth + layerWidth / 2;
        const neuronY = j * neuronHeight + neuronHeight / 2;
        svg
          .append("circle")
          .attr("cx", neuronX)
          .attr("cy", neuronY)
          .attr("r", 8);
        for (let k = 0; k < neuronLayers[i - 1].length; k++) {
          const prevNeuronX = (i - 1) * layerWidth + layerWidth / 2;
          const prevNeuronHeight = svgHeight / neuronLayers[i - 1].length;
          const prevNeuronY = k * prevNeuronHeight + prevNeuronHeight / 2;
          svg
            .append("line")
            .attr("x1", prevNeuronX)
            .attr("y1", prevNeuronY)
            .attr("x2", neuronX)
            .attr("y2", neuronY)
            .attr("stroke", "black")
            .attr("stroke-width", 2);

          if (j == 0) {
            svg
              .append("circle")
              .attr("cx", prevNeuronX)
              .attr("cy", prevNeuronY)
              .attr("r", 8);
          }
        }
      }
    }

    const scale = (val) => d3.interpolateRdBu((val + 1) / 2);

    svg
      .append("rect")
      .attr("x", modelDiagramWidth)
      .attr("y", svgHeight / 2 - dimensions - 100)
      .attr("width", dimensions)
      .attr("height", dimensions)
      .attr("stroke", "black")
      .attr("fill", "white");

    svg
      .append("rect")
      .attr("x", modelDiagramWidth)
      .attr("y", svgHeight / 2 + 100)
      .attr("width", dimensions)
      .attr("height", dimensions)
      .attr("stroke", "black")
      .attr("fill", "white");

    const xAxisScale = d3.scaleLinear().domain([-5, 5]).range([0, dimensions]);
    const yAxisScale = d3.scaleLinear().domain([5, -5]).range([0, dimensions]);
    svg
      .append("g")
      .call(d3.axisBottom(xAxisScale).tickValues([-5, 0, 5]))
      .attr(
        "transform",
        `translate(${modelDiagramWidth}, ${svgHeight / 2 - 100})`
      );
    svg
      .append("g")
      .call(d3.axisLeft(yAxisScale.domain([5, -5])).tickValues([-5, 0, 5]))
      .attr(
        "transform",
        `translate(${modelDiagramWidth}, ${svgHeight / 2 - dimensions - 100})`
      );

    svg
      .append("g")
      .call(d3.axisBottom(xAxisScale).tickValues([-5, 0, 5]))
      .attr(
        "transform",
        `translate(${modelDiagramWidth}, ${svgHeight / 2 + dimensions + 100})`
      );

    svg
      .append("g")
      .call(d3.axisLeft(yAxisScale).tickValues([-5, 0, 5]))
      .attr(
        "transform",
        `translate(${modelDiagramWidth}, ${svgHeight / 2 + dimensions - 100})`
      );

    svg
      .append("text")
      .text("Actual")
      .attr("x", modelDiagramWidth + 10)
      .attr("y", svgHeight / 2 - dimensions - 110);

    svg
      .append("text")
      .text("Predicted")
      .attr("x", modelDiagramWidth + 10)
      .attr("y", svgHeight / 2 + 90);
    data.class1.forEach((point) => {
      svg
        .append("circle")
        .attr("cx", modelDiagramWidth + xAxisScale(point[0].value))
        .attr(
          "cy",
          svgHeight / 2 - dimensions - 100 + yAxisScale(point[1].value)
        )
        .attr("r", 1)
        .attr("stroke", "red")
        .attr("fill", "red");
    });
    data.class2.forEach((point) => {
      svg
        .append("circle")
        .attr("cx", modelDiagramWidth + xAxisScale(point[0].value))
        .attr(
          "cy",
          svgHeight / 2 - dimensions - 100 + yAxisScale(point[1].value)
        )
        .attr("r", 1)
        .attr("stroke", "blue")
        .attr("fill", "blue");
    });

    if (modelPreds) {
      modelPreds.forEach((elem) => {
        const colour = scale(elem.pred);
        svg
          .append("circle")
          .attr("cx", modelDiagramWidth + xAxisScale(elem.point[0].value))
          .attr("cy", svgHeight / 2 + 100 + yAxisScale(elem.point[1].value))
          .attr("r", 1)
          .attr("stroke", colour)
          .attr("fill", colour);
      });
    }
    // draw output
  }, [model, svgWidth, svgHeight, modelPreds, data]);

  return (
    <div className="ts-nets-page-wrapper">
      <div className="ts-nets-content-wrapper">
        <h2>Model Configuration</h2>
        <FormGroup>
          <div className="ts-nets-model-config-row">
            <Label>
              Hidden Layers:{" "}
              <NumericInput
                min={0}
                max={4}
                step={1}
                defaultValue={hiddenLayersN}
                onValueChange={setHiddenLayersN}
              />
            </Label>
          </div>
          <ControlGroup>
            {hiddenLayerSizes.map((size, i) => (
              <div
                key={`hidden_layer_${i}`}
                className="ts-nets-model-config-row"
              >
                <Label>
                  Hidden Layer {i + 1} Size:
                  <NumericInput
                    min={1}
                    max={10}
                    step={1}
                    defaultValue={size}
                    onValueChange={(val) => {
                      const newSizes = [...hiddenLayerSizes];
                      newSizes[i] = val;
                      setHiddenLayerSizes(newSizes);
                    }}
                  />
                </Label>
                <Label>Hidden Layer {i + 1} Activation:</Label>
                <Select2
                  activeItem={hiddenLayerActivations[i]}
                  items={[NonLinearityTypes.Tanh]}
                  itemRenderer={(item, itemProps) =>
                    itemRendererProxy(item, itemProps, i)
                  }
                  onItemSelect={(item) =>
                    setHiddenLayerActivations(
                      hiddenLayerActivations.map((elem, j) =>
                        i === j ? item : elem
                      )
                    )
                  }
                  filterable={false}
                >
                  <Button
                    text={hiddenLayerActivations[i]}
                    rightIcon="caret-down"
                    style={{
                      width: "85%",
                      margin: "0 5em 0 0",
                      background: "white",
                    }}
                  />
                </Select2>
              </div>
            ))}
          </ControlGroup>
          <FormGroup>
            {featureList.map((feature, i) => (
              <div key={`feature_${i}`}>
                <Checkbox
                  checked={!!featureMask[i]}
                  disabled={
                    !!featureMask[i] &&
                    featureMask.filter((x) => x).length === 1
                  }
                  onChange={() => {
                    const newMask = [...featureMask];
                    newMask[i] = !newMask[i];
                    setFeatureMask(newMask);
                  }}
                >
                  {feature}
                </Checkbox>
              </div>
            ))}
          </FormGroup>
        </FormGroup>
        {model && data?.class1?.length && data.class2?.length && (
          <>
            <h2>Model Controls</h2>
            <FormGroup>
              <ControlGroup>
                <Button
                  intent="primary"
                  onClick={() => {
                    const testData = [...data.class1, ...data.class2].map(
                      (point) => ({
                        point,
                        features: point.filter((_, i) => featureMask[i]),
                      })
                    );
                    setModelPreds(
                      testData.reduce(
                        (prev, curr) => [
                          ...prev,
                          {
                            point: curr.point,
                            pred: (
                              model.forward(curr.features)[0] as Atom
                            ).tanh().value,
                          },
                        ],
                        [] as Array<{ point: Atom[]; pred: number }>
                      )
                    );
                  }}
                >
                  Predict
                </Button>
                <Button
                  intent="primary"
                  onClick={() => {
                    const preds: Array<{ point: Atom[]; pred: number }> = [];
                    for (let i = -5; i <= 5; i += 0.1) {
                      for (let j = -5; j <= 5; j += 0.1) {
                        const [x, y] = [new Atom(i), new Atom(j)];
                        const selectedFeatures = [
                          x,
                          y,
                          new Atom(x.value * x.value),
                          new Atom(y.value * y.value),
                          new Atom(Math.sin(x.value)),
                          new Atom(Math.sin(y.value)),
                        ].filter((_, i) => featureMask[i]);
                        preds.push({
                          point: [x, y],
                          pred: (
                            model.forward(selectedFeatures)[0] as Atom
                          ).tanh().value,
                        });
                      }
                    }
                    setModelPreds(preds);
                  }}
                >
                  Draw Decision Boundary
                </Button>
              </ControlGroup>
              <br />
              <ControlGroup>
                <Button intent="primary" onClick={() => trainModel(1)}>
                  Train for 1 Epoch
                </Button>
                <Button intent="primary" onClick={() => trainModel(100)}>
                  Train for 100 Epochs
                </Button>
                <Button intent="primary" onClick={() => trainModel(1000)}>
                  Train for 1,000 Epochs
                </Button>
              </ControlGroup>
              <br />
              <ControlGroup>
                {" "}
                <Label>
                  Learning Rate
                  <NumericInput
                    min={0}
                    max={1}
                    step={0.1}
                    defaultValue={learningRate}
                    onValueChange={setLearningRate}
                  />
                </Label>
                <Label>
                  {" "}
                  Boundary Type
                  <Select2
                    activeItem={boundaryType}
                    items={Object.values(DatasetTypes)}
                    itemRenderer={(item, itemProps) =>
                      itemRendererProxy(item, itemProps, -1)
                    }
                    onItemSelect={(item) => setBoundaryType(item)}
                    filterable={false}
                  >
                    <Button
                      text={boundaryType}
                      rightIcon="caret-down"
                      style={{
                        width: "85%",
                        margin: "0 5em 0 0",
                        background: "white",
                      }}
                    />
                  </Select2>
                </Label>
              </ControlGroup>
            </FormGroup>
          </>
        )}
      </div>
      <div className="ts-nets-diagram">
        <svg ref={svgRef} width={svgWidth} height={svgHeight} />
      </div>
    </div>
  );
};

const itemRendererProxy = (item, props, idx) => {
  const renderActivationSelectItem: ItemRenderer<NonLinearityTypes> = (
    activationType,
    { handleClick, handleFocus, modifiers }
  ) => {
    return (
      <MenuItem
        active={modifiers.active}
        disabled={modifiers.disabled}
        onClick={handleClick}
        onFocus={handleFocus}
        roleStructure="listoption"
        text={activationType}
        key={`h_${activationType}_${idx}`}
      />
    );
  };
  return renderActivationSelectItem(item, props);
};

export default TsNetsDemo;
