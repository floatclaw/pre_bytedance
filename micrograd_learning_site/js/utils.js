/**
 * micrograd 学习网站通用工具函数
 * 实现标量自动微分引擎、神经网络模块与辅助工具
 */

const MGUtils = {
    /**
     * 标量 Value，支持自动微分
     */
    Value: class {
        constructor(data, _children = [], _op = '', label = '') {
            this.data = data;
            this.grad = 0.0;
            this._backward = () => {};
            this._prev = new Set(_children);
            this._op = _op;
            this.label = label;
        }

        toString() {
            return `Value(data=${this.data}, grad=${this.grad})`;
        }

        add(other) {
            other = other instanceof MGUtils.Value ? other : new MGUtils.Value(other);
            const out = new MGUtils.Value(this.data + other.data, [this, other], '+');

            out._backward = () => {
                this.grad += out.grad;
                other.grad += out.grad;
            };

            return out;
        }

        mul(other) {
            other = other instanceof MGUtils.Value ? other : new MGUtils.Value(other);
            const out = new MGUtils.Value(this.data * other.data, [this, other], '*');

            out._backward = () => {
                this.grad += other.data * out.grad;
                other.grad += this.data * out.grad;
            };

            return out;
        }

        pow(other) {
            if (typeof other !== 'number') throw new Error('only supporting number powers');
            const out = new MGUtils.Value(Math.pow(this.data, other), [this], `**${other}`);

            out._backward = () => {
                this.grad += (other * Math.pow(this.data, other - 1)) * out.grad;
            };

            return out;
        }

        neg() {
            return this.mul(-1);
        }

        sub(other) {
            return this.add(other instanceof MGUtils.Value ? other.neg() : -other);
        }

        div(other) {
            other = other instanceof MGUtils.Value ? other : new MGUtils.Value(other);
            return this.mul(other.pow(-1));
        }

        relu() {
            const out = new MGUtils.Value(this.data < 0 ? 0 : this.data, [this], 'ReLU');

            out._backward = () => {
                this.grad += (out.data > 0 ? 1 : 0) * out.grad;
            };

            return out;
        }

        tanh() {
            const t = Math.tanh(this.data);
            const out = new MGUtils.Value(t, [this], 'tanh');

            out._backward = () => {
                this.grad += (1 - t * t) * out.grad;
            };

            return out;
        }

        backward() {
            const topo = [];
            const visited = new Set();

            function build(v) {
                if (!visited.has(v)) {
                    visited.add(v);
                    v._prev.forEach(build);
                    topo.push(v);
                }
            }

            build(this);

            this.grad = 1.0;
            for (let i = topo.length - 1; i >= 0; i--) {
                topo[i]._backward();
            }
        }
    },

    /**
     * 单个神经元
     */
    Neuron: class {
        constructor(nin, activation = 'tanh') {
            this.w = [];
            for (let i = 0; i < nin; i++) {
                this.w.push(new MGUtils.Value((Math.random() * 2 - 1) * Math.sqrt(2.0 / nin)));
            }
            this.b = new MGUtils.Value(0.0);
            this.activation = activation;
        }

        parameters() {
            return [...this.w, this.b];
        }

        forward(x) {
            let act = this.b;
            for (let i = 0; i < this.w.length; i++) {
                act = act.add(this.w[i].mul(x[i]));
            }
            if (this.activation === 'tanh') return act.tanh();
            if (this.activation === 'relu') return act.relu();
            return act;
        }
    },

    /**
     * 全连接层
     */
    Layer: class {
        constructor(nin, nout, activation = 'tanh') {
            this.neurons = [];
            for (let i = 0; i < nout; i++) {
                this.neurons.push(new MGUtils.Neuron(nin, activation));
            }
        }

        parameters() {
            return this.neurons.flatMap(n => n.parameters());
        }

        forward(x) {
            const outs = this.neurons.map(n => n.forward(x));
            return outs.length === 1 ? outs[0] : outs;
        }
    },

    /**
     * 多层感知机
     */
    MLP: class {
        constructor(nin, nouts, activation = 'tanh') {
            const sizes = [nin, ...nouts];
            this.layers = [];
            for (let i = 0; i < nouts.length; i++) {
                const act = (i === nouts.length - 1) ? '' : activation;
                this.layers.push(new MGUtils.Layer(sizes[i], sizes[i + 1], act));
            }
        }

        parameters() {
            return this.layers.flatMap(l => l.parameters());
        }

        forward(x) {
            let out = x;
            for (const layer of this.layers) {
                out = layer.forward(out);
            }
            return out;
        }
    },

    /**
     * 生成 2D Moon 数据集
     * @param {number} n 样本数
     * @param {number} noise 噪声强度
     * @returns {{points: {x:number,y:number,label:number}[], classes: number[]}}
     */
    generateMoons(n = 100, noise = 0.1) {
        const points = [];
        const nPerClass = Math.floor(n / 2);

        for (let i = 0; i < nPerClass; i++) {
            const t = (i / nPerClass) * Math.PI;
            const x = Math.cos(t) + (Math.random() - 0.5) * noise;
            const y = Math.sin(t) + (Math.random() - 0.5) * noise;
            points.push({ x, y, label: 0 });
        }

        for (let i = 0; i < nPerClass; i++) {
            const t = (i / nPerClass) * Math.PI;
            const x = 1 - Math.cos(t) + (Math.random() - 0.5) * noise;
            const y = 1 - Math.sin(t) + (Math.random() - 0.5) * noise - 0.5;
            points.push({ x, y, label: 1 });
        }

        return { points, classes: [0, 1] };
    },

    /**
     * Sigmoid 函数
     */
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    },

    /**
     * ReLU 函数
     */
    relu(x) {
        return x < 0 ? 0 : x;
    },

    /**
     * 函数导数
     */
    derivative(fn, x, h = 1e-5) {
        return (fn(x + h) - fn(x - h)) / (2 * h);
    },

    /**
     * 线性插值
     */
    lerp(a, b, t) {
        return a + (b - a) * t;
    },

    /**
     * 绘制圆角矩形路径
     */
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MGUtils;
}
