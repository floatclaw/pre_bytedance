"""
single-neuron-and/train_and_with_backprop.py

用反向传播训练单个神经元学会 AND 门。

和 train_and.py 的区别：
- train_and.py 用的是感知机学习规则，不显示梯度；
- 这个版本手动实现了一个微型的自动微分引擎（类似 micrograd），
  用梯度下降 + 反向传播来更新参数。

学习目标：
    - 理解反向传播到底在算什么。
    - 理解损失函数、梯度、参数更新之间的关系。
    - 看到 micrograd 的核心思想：用计算图自动求梯度。
"""

import math
import random


# AND 门数据集：两个输入 + 一个目标输出
SAMPLES = [
    {"x1": 0, "x2": 0, "y": 0},
    {"x1": 0, "x2": 1, "y": 0},
    {"x1": 1, "x2": 0, "y": 0},
    {"x1": 1, "x2": 1, "y": 1},
]


class Value:
    """
    标量值，支持自动微分。

    这是 micrograd 中 Value 类的简化版。每个 Value 保存：
    - data：当前数值
    - grad：最终损失对这个值的梯度
    - _prev：产生这个值的子节点
    - _backward：反向传播时如何计算子节点梯度的闭包
    """

    def __init__(self, data, _children=(), _op=""):
        self.data = data
        self.grad = 0.0
        self._prev = set(_children)
        self._op = _op
        self._backward = lambda: None

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data + other.data, (self, other), "+")

        def _backward():
            self.grad += out.grad
            other.grad += out.grad

        out._backward = _backward
        return out

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        out = Value(self.data * other.data, (self, other), "*")

        def _backward():
            self.grad += other.data * out.grad
            other.grad += self.data * out.grad

        out._backward = _backward
        return out

    def __neg__(self):
        return self * -1

    def __sub__(self, other):
        return self + (-other)

    def __pow__(self, other):
        assert isinstance(other, (int, float)), "只支持数字幂次"
        out = Value(self.data**other, (self,), f"**{other}")

        def _backward():
            self.grad += (other * self.data ** (other - 1)) * out.grad

        out._backward = _backward
        return out

    def sigmoid(self):
        """Sigmoid 激活函数：把任意实数压缩到 (0, 1) 之间。"""
        s = 1 / (1 + math.exp(-self.data))
        out = Value(s, (self,), "sigmoid")

        def _backward():
            # sigmoid 的导数 = sigmoid(x) * (1 - sigmoid(x))
            self.grad += (s * (1 - s)) * out.grad

        out._backward = _backward
        return out

    def backward(self):
        """
        反向传播：从当前节点开始，把梯度传回所有子节点。

        步骤：
        1. 拓扑排序：确保每个节点在其子节点之后处理
        2. 把自己对自己的梯度设为 1
        3. 从后往前调用每个节点的 _backward
        """
        topo = []
        visited = set()

        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._prev:
                    build_topo(child)
                topo.append(v)

        build_topo(self)

        self.grad = 1.0
        for v in reversed(topo):
            v._backward()

    def __repr__(self):
        return f"Value(data={self.data:.4f}, grad={self.grad:.4f})"


class SingleNeuronModel:
    """
    单个神经元模型，使用反向传播训练。

    结构：z = w1*x1 + w2*x2 + b，输出 = sigmoid(z)
    """

    def __init__(self, input_dim: int = 2, lr: float = 1.0, seed: int = None):
        if seed is not None:
            random.seed(seed)

        self.input_dim = input_dim
        self.lr = lr

        # 用 Value 包装参数，这样它们才能参与计算图并自动求梯度
        self.w = [Value(random.uniform(-1.0, 1.0)) for _ in range(input_dim)]
        self.b = Value(random.uniform(-1.0, 1.0))

    def parameters(self):
        """返回所有可训练参数，方便清零梯度和更新。"""
        return self.w + [self.b]

    def zero_grad(self):
        """每次反向传播前，把梯度清零。"""
        for p in self.parameters():
            p.grad = 0.0

    def forward(self, x):
        """前向传播：计算 sigmoid(w·x + b)。"""
        # z = w1*x1 + w2*x2 + b
        z = self.b
        for wi, xi in zip(self.w, x):
            z = z + wi * xi

        # 用 sigmoid 把 z 映射到 (0, 1)，作为「输出为 1 的概率」
        return z.sigmoid()

    def predict(self, x):
        """预测：输出大于 0.5 认为是类别 1。"""
        out = self.forward(x)
        return 1 if out.data > 0.5 else 0

    def compute_loss(self, samples):
        """
        计算均方误差损失：
        loss = 平均值((预测值 - 真实值)^2)
        """
        total_loss = Value(0.0)
        for s in samples:
            x = [s["x1"], s["x2"]]
            y = s["y"]
            pred = self.forward(x)
            # (pred - y)^2
            loss = (pred - y) ** 2
            total_loss = total_loss + loss

        return total_loss * (1.0 / len(samples))

    def train_step(self, samples):
        """
        一轮梯度下降：
        1. 清零梯度
        2. 前向计算损失
        3. 反向传播求梯度
        4. 更新参数
        """
        self.zero_grad()

        loss = self.compute_loss(samples)
        loss.backward()

        # 梯度下降：参数 = 参数 - 学习率 * 梯度
        for p in self.parameters():
            p.data -= self.lr * p.grad

        return loss.data

    def fit(self, samples, max_epochs=100):
        """训练多轮，直到损失很小或达到最大轮数。"""
        for epoch in range(1, max_epochs + 1):
            loss = self.train_step(samples)

            # 统计错误数
            errors = sum(
                1 for s in samples if self.predict([s["x1"], s["x2"]]) != s["y"]
            )

            print(
                f"Epoch {epoch:2d}: "
                f"w1={self.w[0].data:7.4f}, w2={self.w[1].data:7.4f}, "
                f"b={self.b.data:7.4f}, "
                f"loss={loss:7.4f}, errors={errors}"
            )

            # 如果预测全对，认为已经学会（对于分类任务，0 错误就是目标）
            if errors == 0:
                print(f"\n✅ 训练完成！第 {epoch} 轮所有样本预测正确。\n")
                return epoch

        print(f"\n⚠️  达到最大轮数 {max_epochs}，尚未收敛。\n")
        return max_epochs

    def evaluate(self, samples):
        """评估模型。"""
        print("最终验证：")
        print("-" * 45)
        print(f"{'x1':>4} {'x2':>4} {'目标':>6} {'预测':>6} {'概率':>10}")
        print("-" * 45)
        for s in samples:
            x = [s["x1"], s["x2"]]
            prob = self.forward(x).data
            pred = self.predict(x)
            mark = "✅" if pred == s["y"] else "❌"
            print(
                f"{s['x1']:>4} {s['x2']:>4} {s['y']:>6} {pred:>6} {prob:>10.4f} {mark}"
            )
        print("-" * 45)

    def __repr__(self):
        params = ", ".join(f"w{i+1}={w.data:.4f}" for i, w in enumerate(self.w))
        return f"SingleNeuronModel({params}, b={self.b.data:.4f})"


if __name__ == "__main__":
    model = SingleNeuronModel(input_dim=2, lr=1.0, seed=42)
    print(f"创建模型：{model}\n")

    model.fit(SAMPLES, max_epochs=200)

    print(f"训练后的模型：{model}\n")
    model.evaluate(SAMPLES)

    # 额外展示一个参数的梯度示例
    print("\n梯度示例（最后一轮后）：")
    print(f"  w1.grad = {model.w[0].grad:.4f}")
    print(f"  w2.grad = {model.w[1].grad:.4f}")
    print(f"  b.grad  = {model.b.grad:.4f}")
    print("\n这些梯度告诉我们：如果把这个参数稍微增大，损失会怎么变化。")
