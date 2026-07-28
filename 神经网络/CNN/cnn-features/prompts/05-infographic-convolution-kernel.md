---
illustration_id: 05
type: infographic
style: minimal-flat
---

卷积核滑动计算 - 信息图

Layout: 从左到右三步流程

ZONES:
- Zone 1 (LEFT): 3×3 卷积核权重矩阵
  - 显示数值：
    -1  0  1
    -1  0  1
    -1  0  1
  - 左侧 Coral，右侧 Mint，中间零为灰色
  - 标签：权重矩阵 = 空间模板
- Zone 2 (CENTER): 卷积核覆盖在图像局部 3×3 区域上
  - 局部区域显示左侧暗、右侧亮的竖直边缘
  - 对应位置相乘的示意（小×符号）
  - 标签：滑动加权求和
- Zone 3 (RIGHT): 输出的特征图
  - 一个小网格，中心位置高亮
  - 标签：特征图 / 匹配度

LABELS: 卷积核, 图像, 对应相乘, 相加, 特征图, 竖直边缘
COLORS: Cream background (#F5F0E6), Coral Red (#E07A5F), Mint Green (#81B29A), Mustard Yellow (#F2CC8F), gray for zero, black outlines
STYLE: flat vector infographic, clean black outlines, grid cells, bold arrows showing flow, modern tech illustration

Text should be large and prominent with handwritten-style fonts. Keep minimal, focus on keywords.

ASPECT: 16:9
