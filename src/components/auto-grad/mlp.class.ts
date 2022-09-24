import { Layer } from "./layer.class";
import { Value } from "./value.class";

export class MLP {
  private layers: Layer[] = [];

  constructor(network_inputs: number, layer_outs: number[]) {
    const sizes = [network_inputs, ...layer_outs];
    for (let idx = 0; idx < layer_outs.length; idx++) {
      this.layers.push(new Layer(sizes[idx], sizes[idx + 1]));
    }
  }

  public forward(x: Value[], dropOutP: number = 1): Value[] {
    return this.layers.reduce(
      (x, l, idx) =>
        l.forward(x, idx === this.layers.length - 1 ? 1 : dropOutP),
      x
    );
  }

  public params(): Value[] {
    return this.layers.reduce(
      (params: Value[], l) => [...params, ...l.params()],
      []
    );
  }

  public getLayers(): Layer[] {
    return this.layers;
  }
}
