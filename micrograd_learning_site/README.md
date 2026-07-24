# micrograd 学习网站

一个完全静态、可离线使用的 micrograd 交互式学习网站，无需后端和外部 CDN。

---

## 内容结构

- 导学：自动微分与从零实现神经网络
- 第 1 章：Value 对象与计算图
- 第 2 章：前向传播
- 第 3 章：反向传播
- 第 4 章：链式法则与拓扑排序
- 第 5 章：激活函数（Tanh / Sigmoid / ReLU）
- 第 6 章：神经网络与训练（MLP、SGD、Moon 数据集）
- 第 7 章：真实案例与面试题
- 总结与延伸

---

## 交互 Demo

- **计算图可视化**：逐步执行前向传播与反向传播
- **标量自动微分 playground**：拖动 x、y 滑块，实时观察梯度
- **激活函数探索器**：观察 Tanh/Sigmoid/ReLU 的输出与导数
- **MLP Moon 分类器**：训练二层 MLP，实时显示决策边界和损失曲线

---

## 如何打开

### 方式 1：本地 HTTP 服务器（推荐）

```bash
cd micrograd_learning_site
python3 -m http.server 8080
```

然后访问 http://localhost:8080

### 方式 2：直接离线打开

双击 `index.html`，无需联网即可学习。

### 方式 3：运行原版 micrograd 源码

网站目录内已包含原版 micrograd 源码，可以直接跑：

```bash
cd micrograd_learning_site/micrograd
python3 run_demo.py
```

示例输出：

```
step   0 | loss = 2.7653
step  10 | loss = 0.4492
step  20 | loss = 0.3612
step  30 | loss = 0.3417
step  40 | loss = 0.3314

accuracy = 71/80 = 88.75%
micrograd demo ran successfully
```

也可以直接查看官方示例：

```bash
jupyter notebook demo.ipynb
```

---

## 文件结构

```
micrograd_learning_site/
├── index.html                  # 主页面
├── README.md                   # 本文件
├── css/                        # 样式文件
│   ├── base.css
│   ├── components.css
│   ├── demos.css
│   └── animations.css
├── js/                         # 网站交互引擎
│   ├── main.js
│   ├── utils.js
│   ├── quiz.js
│   ├── cases.js
│   └── demos/
│       ├── computational-graph.js
│       ├── scalar-autodiff.js
│       ├── activation-functions.js
│       └── mlp-trainer.js
├── micrograd/                  # 原版 micrograd 源码（已下载）
│   ├── micrograd/engine.py     # 标量 autograd 引擎
│   ├── micrograd/nn.py         # 神经网络库
│   ├── demo.ipynb              # 官方训练示例
│   └── run_demo.py             # 可直接运行的 Moon 二分类示例
└── images/                     # 图片资源
```

---

## 技术栈

- HTML5 + CSS3 + 原生 JavaScript
- 无框架、无外部 CDN、无后端
- localStorage 持久化学习进度
- Canvas 2D 绘制交互可视化

---

## 浏览器兼容性

- Chrome / Edge / Safari / Firefox 最新版本
- 移动端浏览器也可访问
- 支持亮色/暗色模式切换

---

## 参考资料

- micrograd 仓库：https://github.com/karpathy/micrograd
- Karpathy 视频：The spelled-out intro to neural networks and backpropagation
