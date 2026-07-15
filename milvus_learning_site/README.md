# Milvus 零基础学习指南

一个面向零基础/有技术背景但不熟悉向量数据库的 **Milvus** 交互式学习网站。

> 学完后能理解向量数据库原理、会用 Milvus 做检索、能向别人讲清楚、能在面试/工作中应用。

---

## 项目结构

```
milvus_learning_site/
├── index.html                  # 主页面
├── README.md                   # 本文件
├── css/                        # 样式文件
│   ├── base.css
│   ├── components.css
│   ├── demos.css
│   └── animations.css
├── js/
│   ├── main.js                 # 主题、导航、滚动监听、进度
│   ├── utils.js                # 向量/距离计算工具
│   ├── quiz.js                 # 章节测验系统
│   ├── cases.js                # 真实案例与面试题渲染
│   └── demos/                  # 交互 Demo
│       ├── embedding-explorer.js
│       ├── similarity-metrics.js
│       ├── index-comparison.js
│       ├── search-simulator.js
│       └── collection-designer.js
└── data/
    ├── quizzes.json
    └── cases.json
```

---

## 如何打开

### 方法 1：直接双击打开

直接用浏览器打开 `index.html` 即可。所有资源都是本地相对路径，无需联网。

### 方法 2：本地服务器

```bash
cd milvus_learning_site
python3 -m http.server 8080
```

然后访问 http://localhost:8080

---

## 内容章节

1. **导学**：什么是向量数据库、为什么需要 Milvus
2. **第 1 章：向量与 Embedding**
3. **第 2 章：相似度度量**（Cosine / Euclidean / IP）
4. **第 3 章：ANN 与索引**（FLAT / IVF / HNSW）
5. **第 4 章：Milvus 核心概念**（Collection / Entity / Field / Schema / Partition）
6. **第 5 章：数据建模与写入**
7. **第 6 章：搜索与查询**（search / query / 混合搜索）
8. **第 7 章：部署与生态**
9. **第 8 章：真实案例与面试题**
10. **总结与延伸**

---

## 交互 Demo

- **Embedding Explorer**：在 2D 向量空间中点击查询，观察 Top-K 最近邻
- **Similarity Metrics**：拖动滑块比较 Cosine、Euclidean、IP
- **Index Comparison**：对比 FLAT、IVF、HNSW 的查询耗时和召回率
- **Search Simulator**：设置 top-k、标量过滤，生成 PyMilvus 代码
- **Collection Designer**：设计 Collection Schema，实时生成 JSON 和 Python 代码

---

## 离线使用

本网站没有任何外部 CDN 依赖，所有 CSS、JS 都是本地文件。可以把整个目录复制到任何地方离线使用。

---

## 浏览器兼容性

- Chrome / Edge / Safari / Firefox 最新版本
- 移动端浏览器也可访问
- 支持亮色/暗色模式切换

---

## 参考资料

- [Milvus 官方文档](https://milvus.io/docs)
- [Milvus GitHub](https://github.com/milvus-io/milvus)
