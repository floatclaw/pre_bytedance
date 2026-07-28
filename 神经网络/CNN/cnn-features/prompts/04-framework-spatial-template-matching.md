---
illustration_id: 04
type: framework
style: minimal-flat
---

空间模板匹配核心逻辑 - 概念框架图

STRUCTURE: 中心辐射式

NODES:
- 中心节点：局部模板（一个小 3×3 网格，显示权重分布）
- 左上分支：局部区域输入（3×3 图像块）
- 右上分支：匹配 → 强响应（绿色对勾，粗箭头，高亮输出）
- 右下分支：不匹配 → 抑制（红色叉，细箭头，暗淡输出）
- 底部：空间模板匹配

RELATIONSHIPS: 中心模板指向输入，输入通过匹配判断分为通过/抑制两个结果
STYLE: flat vector framework diagram with geometric nodes and bold connectors, clean black outlines, cream background

LABELS: 局部模板, 输入, 匹配, 不匹配, 强响应, 抑制
COLORS: Cream background (#F5F0E6), Coral Red (#E07A5F) for mismatch, Mint Green (#81B29A) for match, Mustard Yellow (#F2CC8F) for center, black outlines

Text should be large and prominent with handwritten-style fonts. Keep minimal, focus on keywords.

ASPECT: 16:9
