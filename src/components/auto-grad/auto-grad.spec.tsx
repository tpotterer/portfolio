import { Value } from "./value.class";
import { Neuron } from "./neuron.class";
import { MLP } from "./mlp.class";

describe("value tests", () => {
  it("add", () => {
    const a = new Value(2);
    const b = new Value(3);
    const res = a.add(b);
    expect(res.data).toEqual(5);
  });

  it("mul", () => {
    const a = new Value(2);
    const b = new Value(3);
    const res = a.mul(b);
    expect(res.data).toEqual(6);
  });

  it("tanh", () => {
    const a = new Value(0.5);
    const res = a.tanh();
    expect(res.data).toEqual(0.46211715726000974);
  });

  it("sub", () => {
    const a = new Value(2);
    const b = new Value(3);
    const res = a.sub(b);
    expect(res.data).toEqual(-1);
  });

  it.only("div", () => {
    const a = new Value(3);
    const b = new Value(2);
    const c = new Value(1);

    const d = b.div(c);
    const e = a.add(d);

    e.backward();

    expect([a.grad, b.grad, c.grad, d.grad, e.grad]).toEqual([1, 1, -2, 1, 1]);
  });
});

describe("backward tests", () => {
  it("simple backward", () => {
    const a = new Value(0.1);
    const b = new Value(0.5);
    const c = new Value(-0.5);
    const d = a.mul(b);
    const e = d.add(c);
    const L = e.tanh();

    L.backward();

    expect(a.grad).toEqual(0.4110006146845269);
    expect(b.grad).toEqual(0.08220012293690539);
    expect(c.grad).toEqual(0.8220012293690538);
    expect(d.grad).toEqual(0.8220012293690538);
    expect(e.grad).toEqual(0.8220012293690538);
    expect(L.grad).toEqual(1);
  });

  it("value used twice example", () => {
    const a = new Value(-2);
    const b = a.add(a);

    b.backward();

    expect(a.grad).toEqual(2);
  });

  it("example with sub and pow", () => {
    const a = new Value(0.4);
    const b = new Value(0.3);
    const c = 2;
    const d = b.sub(a);
    const e = d.pow(c);
    const f = e.tanh();

    f.backward();

    expect(a.grad).toEqual(0.19998000133325783);
    expect(b.grad).toEqual(-0.19998000133325783);
    expect(d.grad).toEqual(-0.19998000133325783);
    expect(e.grad).toEqual(0.9999000066662889);
    expect(f.grad).toEqual(1);
  });
});

describe("neuron tests", () => {
  it("neuron test", () => {
    const n = new Neuron(2, true);
    const L = n.forward([new Value(1), new Value(2)]);

    L.backward();

    const true_grads = [
      0.07065082485316443, 0.14130164970632886, 0.07065082485316443,
    ];

    for (const i in n.params()) {
      expect(n.params()[i].grad).toEqual(true_grads[i]);
    }
  });

  describe("full network tests", () => {
    it("basic test", () => {
      const n = new MLP(3, [4, 4, 1]);
      const x = [new Value(1), new Value(2), new Value(3)];
      const o = n.forward(x);

      o[0].backward();
      // obviously hard to unit test, just checking it doesn't error
    });

    it("training test", () => {
      const xs = [
        [new Value(2.0), new Value(3.0), new Value(-1.0)],
        [new Value(3.0), new Value(-1.0), new Value(0.5)],
        [new Value(0.5), new Value(1.0), new Value(1.0)],
        [new Value(1.0), new Value(1.0), new Value(-1.0)],
      ];
      const ys = [
        new Value(1.0),
        new Value(-1.0),
        new Value(-1.0),
        new Value(1.0),
      ];

      const model = new MLP(3, [4, 4, 1]);

      let first_loss;
      let last_loss;
      for (let i = 0; i < 300; i++) {
        const ypred = xs.map((elem) => model.forward(elem));

        const loss = ypred
          .map((elem, i) => elem[0].sub(ys[i]).pow(2))
          .reduce((a, b) => a.add(b));

        last_loss = loss.data;
        if (i === 0) {
          first_loss = loss.data;
        }

        model.params().forEach((param) => (param.grad = 0.0));
        loss.backward();

        model.params().forEach((param) => (param.data += -0.1 * param.grad));
      }

      // this is a stupid test, but just want to show some training has been done
      expect(first_loss * 0.1 > last_loss).toEqual(true);
    });
  });
});
