# ByteCover3 零基础学习网站

一个可交互、可离线使用的 ByteCover3 学习课程网站。

## 目录结构

```
bytecover3_site/
├── index.html              # 主页面
├── css/
│   ├── base.css           # 基础样式、变量、布局
│   ├── components.css     # 组件样式（卡片、手风琴、路线等）
│   ├── demos.css          # 交互 Demo 样式
│   └── animations.css     # 动画相关样式
├── js/
│   ├── main.js            # 主题、导航、进度追踪
│   ├── utils.js           # 数学工具（余弦相似度、MaxMean 等）
│   ├── quiz.js            # 章节测验系统
│   ├── cases.js           # 真实案例与面试题渲染
│   └── demos/             # 交互 Demo
│       ├── piano-cqt.js
│       ├── cqt-visualizer.js
│       ├── maxmean-calculator.js
│       ├── retrieval-simulator.js
│       ├── cnn-animation.js
│       └── hnsw-animation.js
├── data/
│   ├── quizzes.json       # 测验数据
│   └── cases.json         # 案例与面试题数据
└── images/
    └── cqt_demo.png       # CQT 示例图
```

## 如何打开

### 方法 1：直接双击打开
直接用浏览器打开 `index.html` 即可。所有资源都是本地相对路径，无需联网。

### 方法 2：本地服务器
```bash
cd bytecover3_site
python3 -m http.server 8080
```
然后访问 http://localhost:8080

## 内容结构

1. 导学
2. 第 1 章：理解问题
3. 第 2 章：音频如何变成图
4. 第 3 章：神经网络基础
5. 第 4 章：局部特征与 MaxMean
6. 第 5 章：Local Alignment Loss
7. 第 6 章：两阶段检索
8. 第 7 章：Demo 工程化
9. 第 8 章：真实案例与面试题
10. 总结与延伸

## 交互功能

- 🎹 钢琴 → CQT：点击钢琴键看对应 CQT bin
- 📊 CQT 可视化器：播放预设旋律，实时看波形/频谱/CQT
- 🧮 MaxMean 计算器：交互式理解 MaxMean 计算过程
- 🔎 两阶段检索模拟器：体验 ANN 粗排 + MaxMean 精排
- 🔍 CNN 卷积动画：看卷积核如何滑动
- 🗺️ HNSW 搜索动画：看多层图如何搜索最近邻
- 📝 章节测验：每章 2-3 题，即时反馈
- 💼 真实案例 + 面试题：贴近业务场景

## 注意事项

- 音频 Demo 需要浏览器支持 Web Audio API
- 首次播放音频需要用户点击（浏览器安全策略）
- 进度和测验答案保存在浏览器 localStorage 中

## 浏览器兼容性

- Chrome / Edge / Safari / Firefox 最新版本
- 移动端浏览器也可访问
- 支持亮色/暗色模式切换

## 离线使用

本网站没有任何外部 CDN 依赖，所有 CSS、JS、图片都是本地文件。可以将整个 `bytecover3_site` 目录复制到任何地方，双击 `index.html` 即可离线使用。
