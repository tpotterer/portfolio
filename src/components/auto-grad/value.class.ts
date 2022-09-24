export class Value {
  public data: number;
  public label: string;
  private _prev: Value[];
  private _op: string;
  public grad: number;
  public _backward: () => void;

  constructor(data: number, label = "", _prev: Value[] = [], _op = "") {
    this.data = data;
    this.label = label;
    this._prev = _prev;
    this._op = _op;
    this.grad = 0.0;
    this._backward = () => null;
  }

  public backward(): void {
    const topo: Value[] = [];
    const visited = new Set<Value>();
    const build_topo = (v: Value) => {
      if (!visited.has(v)) {
        visited.add(v);
        for (const prev of v._prev) {
          build_topo(prev);
        }
        topo.push(v);
      }
    };

    build_topo(this);
    topo.reverse();
    this.grad = 1.0;
    for (const v of topo) {
      v._backward();
    }
  }

  public add(other: Value): Value {
    const out = new Value(this.data + other.data, "", [this, other], "+");

    const _backward = () => {
      this.grad += 1.0 * out.grad;
      other.grad += 1.0 * out.grad;
    };
    out._backward = _backward;

    return out;
  }

  public div(other: Value): Value {
    return this.mul(other.pow(-1));
  }

  public sub(other: Value): Value {
    const out = new Value(this.data - other.data, "", [this, other], "-");

    const _backward = () => {
      this.grad += 1.0 * out.grad;
      other.grad += -1.0 * out.grad;
    };

    out._backward = _backward;
    return out;
  }

  public mul(other: Value): Value {
    const out = new Value(this.data * other.data, "", [this, other], "*");

    const _backward = () => {
      this.grad += other.data * out.grad;
      other.grad += this.data * out.grad;
    };
    out._backward = _backward;

    return out;
  }

  public pow(other: number): Value {
    const out = new Value(this.data ** other, "", [this], "**");

    const _backward = () => {
      this.grad += other * this.data ** (other - 1) * out.grad;
      // not implementing gradient calcs for other in this case as we will only be using this for constant powers
    };
    out._backward = _backward;

    return out;
  }

  public tanh(): Value {
    const t = Math.tanh(this.data);
    const out = new Value(t, "", [this], "tanh");

    const _backward = () => {
      this.grad += (1.0 - t * t) * out.grad;
    };
    out._backward = _backward;

    return out;
  }

  public toString(): string {
    return `Value(data=${this.data.toString()})`;
  }
}
