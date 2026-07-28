---
illustration_id: 04
type: flowchart
style: minimal-flat
---

多层网络把直线拼成曲线 - 流程图

Layout: 从左到右三层结构

STEPS:
1. INPUT: 两个节点 x1, x2
2. HIDDEN LAYER: 两个神经元 A 和 B，分别画出一条直线边界划分平面；神经元 A 输出高亮的半平面，神经元 B 输出另一个半平面
3. OUTPUT: 一个神经元把 A 和 B 的输出组合，右侧显示最终围出的非线性决策区域（带阴影的曲线/折线区域）

CONNECTIONS: 粗箭头从输入指向隐藏层，从隐藏层指向输出层；每个神经元内部标注 f(·) 表示激活函数
STYLE: flat vector flowchart with bold arrows and geometric neuron containers, clean black outlines, rounded rectangles, soft fills

LABELS: x1, x2, 隐藏层 A, 隐藏层 B, 输出层, 直线 1, 直线 2, 曲线决策边界
COLORS: Cream background (#F5F0E6), neurons in Coral (#E07A5F) and Mint (#81B29A), output region in Mustard Yellow (#F2CC8F), black outlines

Text should be large and prominent with handwritten-style fonts. Keep minimal, focus on keywords.

ASPECT: 16:9
