import { Value } from "./value.class";

export class Neuron {
  private w_in: Value[];
  private b: Value;

  constructor(n_in: number, is_test = false) {
    this.w_in = new Array(n_in)
      .fill(0)
      .map(() => new Value(is_test ? 0.5 : Math.random()));
    this.b = new Value(is_test ? 0.5 : Math.random());
  }

  public forward(x: Value[]): Value {
    const out = x
      .map((v, i) => v.mul(this.w_in[i])) // do all the mults
      .reduce((v1, v2) => v1.add(v2)) // do all the adds
      .add(this.b) // add the bias
      .tanh(); // apply the activation function
    return out;
  }

  public params(): Value[] {
    return [this.b, ...this.w_in];
  }
}
