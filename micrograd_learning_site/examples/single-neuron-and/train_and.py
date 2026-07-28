"""
single-neuron-and/train_and.py

用感知机学习规则训练一个单个神经元学会 AND 门。
这里把「单个神经元」抽象成一个 SingleNeuronModel，它和普通神经网络模型
拥有相同的接口：forward / predict / train_step / fit / evaluate。

学习目标：
    - 理解一个神经元如何表示 AND 这样的简单规律。
    - 理解训练就是「预测 → 看误差 → 调整参数」的循环。
    - 理解即使只有一个神经元，也可以封装成标准的模型接口。
"""

import random


# AND 门数据集：两个输入 + 一个目标输出
# 在机器学习中，这 4 行就是训练集，模型要从中学习规律。
SAMPLES = [
    {"x1": 0, "x2": 0, "y": 0},
    {"x1": 0, "x2": 1, "y": 0},
    {"x1": 1, "x2": 0, "y": 0},
    {"x1": 1, "x2": 1, "y": 1},
]


class SingleNeuronModel:
    """
    单个神经元模型。

    虽然只有一个神经元，但它已经具备一个完整模型的基本结构：
    - 参数（权重 w1、w2 和偏置 b）：模型需要学习的数字
    - 前向计算 forward：从输入得到输出
    - 预测 predict：把输出变成人类可读的类别
    - 训练步骤 train_step：根据错误更新参数
    - 拟合 fit：重复 train_step 直到学会
    - 评估 evaluate：看模型学得怎么样

    以后学到 micrograd 的多层网络时，接口是类似的，只是 forward 和
    train_step 里面会更复杂。
    """

    def __init__(self, input_dim: int = 2, lr: float = 0.3, seed: int = None):
        """
        初始化模型。

        Args:
            input_dim: 输入特征的数量。AND 门有 2 个输入，所以是 2。
            lr: 学习率（learning rate），每次参数调整的步长。
            seed: 随机种子，让结果可复现。
        """
        if seed is not None:
            random.seed(seed)

        self.input_dim = input_dim
        self.lr = lr  # 学习率不能太大（会震荡），也不能太小（学得太慢）

        # 参数：每个输入对应一个权重，再加一个偏置
        # 训练之前，这些数字是随机的，所以初始预测基本都是错的
        self.w = [random.uniform(-1.0, 1.0) for _ in range(input_dim)]
        self.b = random.uniform(-1.0, 1.0)

    def forward(self, x: list[int]) -> float:
        """
        前向传播：计算加权求和 z = w·x + b。

        这是神经元最核心的计算：把每个输入乘以对应权重，加起来，再加偏置。
        """
        z = self.b
        for wi, xi in zip(self.w, x):
            z += wi * xi
        return z

    def predict(self, x: list[int]) -> int:
        """
        预测：z > 0 输出 1，否则输出 0。

        这里用的是最简单的阶跃函数。后面学到激活函数时，会把它换成
        sigmoid、tanh 或 ReLU 等更光滑的函数。
        """
        return 1 if self.forward(x) > 0 else 0

    def train_step(self, samples: list[dict]) -> int:
        """
        感知机学习规则：遍历样本，预测错了就调整参数。

        更新逻辑：
        - error = y - pred
          - 如果目标 y=1 但预测 pred=0，error=+1，说明需要提高输出
          - 如果目标 y=0 但预测 pred=1，error=-1，说明需要降低输出
        - 权重更新：w_i += lr * error * x_i
          - 输入 x_i 越大，对结果影响越大，所以权重调整越多
          - 如果 x_i=0，对应的权重不会更新（因为输入为 0 不影响输出）
        - 偏置更新：b += lr * error
          - 偏置没有对应的输入，所以只按 error 调整

        Args:
            samples: 训练样本列表

        Returns:
            本轮预测错误的样本数量
        """
        errors = 0
        for s in samples:
            # 把样本整理成输入向量 x 和目标 y
            x = [s["x1"], s["x2"]]
            y = s["y"]

            # 先做一次预测
            pred = self.predict(x)

            # 如果预测错了，就调整参数
            if pred != y:
                errors += 1
                error = y - pred  # +1 表示需要提高，-1 表示需要降低

                # 更新每个权重：输入越大，权重调得越多
                for i, xi in enumerate(x):
                    self.w[i] += self.lr * error * xi

                # 更新偏置：相当于调整神经元的激活门槛
                self.b += self.lr * error

        return errors

    def fit(self, samples: list[dict], max_epochs: int = 100) -> int:
        """
        训练多轮，直到所有样本都预测正确，或达到最大轮数。

        Args:
            samples: 训练样本列表
            max_epochs: 最多训练多少轮

        Returns:
            实际训练了多少轮
        """
        for epoch in range(1, max_epochs + 1):
            # 每一轮都遍历所有样本，更新参数
            errors = self.train_step(samples)

            # 打印当前状态，方便观察学习过程
            print(
                f"Epoch {epoch:2d}: "
                f"w1={self.w[0]:7.4f}, w2={self.w[1]:7.4f}, "
                f"b={self.b:7.4f}, errors={errors}"
            )

            # 如果一轮下来没有错误，说明已经学会了
            if errors == 0:
                print(f"\n✅ 训练完成！第 {epoch} 轮收敛。\n")
                return epoch

        print(f"\n⚠️  达到最大轮数 {max_epochs}，尚未收敛。\n")
        return max_epochs

    def evaluate(self, samples: list[dict]) -> None:
        """在测试集上评估模型，打印每个样本的预测结果。"""
        print("最终验证：")
        print("-" * 40)
        print(f"{'x1':>4} {'x2':>4} {'目标':>6} {'预测':>6} {'z':>10}")
        print("-" * 40)
        for s in samples:
            x = [s["x1"], s["x2"]]
            z = self.forward(x)  # 加权求和的结果
            pred = self.predict(x)  # 最终预测的类别
            mark = "✅" if pred == s["y"] else "❌"
            print(
                f"{s['x1']:>4} {s['x2']:>4} {s['y']:>6} {pred:>6} {z:>10.4f} {mark}"
            )
        print("-" * 40)

    def __repr__(self) -> str:
        """让 print(model) 时显示参数，方便调试。"""
        params = ", ".join(f"w{i+1}={w:.4f}" for i, w in enumerate(self.w))
        return f"SingleNeuronModel({params}, b={self.b:.4f})"


if __name__ == "__main__":
    # 创建一个单个神经元模型
    # input_dim=2 表示有 2 个输入；lr=0.3 是学习率；seed=42 让结果可复现
    model = SingleNeuronModel(input_dim=2, lr=0.3, seed=42)
    print(f"创建模型：{model}\n")

    # 训练模型：让它在 AND 数据集上拟合
    model.fit(SAMPLES, max_epochs=100)

    # 打印训练后的模型参数
    print(f"训练后的模型：{model}\n")

    # 评估模型：看看 4 个样本预测得对不对
    model.evaluate(SAMPLES)
