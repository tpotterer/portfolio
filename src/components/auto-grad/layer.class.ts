import { Neuron } from "./neuron.class";
import { Value } from "./value.class";

export class Layer {
  private neurons: Neuron[];
  private dropOutMask: boolean[] = [];

  constructor(
    layer_n_in: number,
    layer_n_out: number,
    is_test: boolean = false
  ) {
    this.neurons = new Array(layer_n_out)
      .fill(0)
      .map(() => new Neuron(layer_n_in, is_test));
  }

  public getDropOutMask(): boolean[] {
    return [...this.dropOutMask];
  }

  public forward(x: Value[], dropOutP: number = 1): Value[] {
    this.dropOutMask = this.neurons.map(() => Math.random() > dropOutP);
    return this.neurons.map((neuron, idx) =>
      !this.dropOutMask[idx] ? neuron.forward(x) : new Value(0)
    );
  }

  public params(): Value[] {
    return this.neurons.reduce(
      (params: Value[], neuron: Neuron) => [...params, ...neuron.params()],
      []
    );
  }

  public getNeurons(): Neuron[] {
    return [...this.neurons];
  }
}
