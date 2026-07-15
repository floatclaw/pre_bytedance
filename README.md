# ByteCover3 学习项目

一个面向零基础学习者的学习资料集合，目前包含：

- **ByteCover3**：翻唱歌曲识别论文学习网站 + Python Demo
- **Milvus**：向量数据库学习网站

> ByteCover3 核心解决「用十几秒的短视频片段，从海量歌曲中找到它的翻唱原曲」。
> Milvus 核心解决「如何高效存储和检索高维向量，实现语义搜索」。

---

## 项目包含什么

```
bytedance/
├── bytecover3_site/          # 翻唱识别交互式课程网站
├── bytecover3_demo/          # 简化版 Python Demo
├── milvus_learning_site/     # Milvus 向量数据库交互式课程网站
└── BYTECOVER3- ACCURATE COVER SONG IDENTIFICATION ON SHORT QUERIES.pdf
                              # 原始论文
```

### 1. `bytecover3_site/` — 翻唱识别交互式课程网站

一个完全静态、可离线使用的学习网站，无需后端和外部 CDN。

**内容结构：**
- 导学 + 学习路线
- 第 1 章：理解问题（翻唱识别难点、全局 vs 局部特征）
- 第 2 章：音频如何变成图（波形、频谱图、CQT）
- 第 3 章：神经网络基础（CNN、ResNet、IBN、GeM Pooling）
- 第 4 章：局部特征与 MaxMean
- 第 5 章：Local Alignment Loss
- 第 6 章：两阶段检索（ANN + MaxMean）
- 第 7 章：Demo 工程化
- 第 8 章：真实案例与面试题
- 总结与延伸

**交互功能：**
- 钢琴 → CQT：点击钢琴键看对应 CQT bin
- CQT 可视化器：播放预设旋律，实时看波形/频谱/CQT
- MaxMean 计算器：交互式理解 MaxMean 计算过程
- 两阶段检索模拟器：体验 ANN 粗排 + MaxMean 精排
- CNN 卷积动画、HNSW 搜索动画
- 章节测验（localStorage 保存进度）

**如何打开：**

```bash
cd bytecover3_site
python3 -m http.server 8080
```

然后访问 http://localhost:8080

也可以直接双击 `index.html` 离线打开。

详见 [`bytecover3_site/README.md`](bytecover3_site/README.md)。

---

### 2. `bytecover3_demo/` — 简化版 Python Demo

一个可以跑起来的简化版 ByteCover3，用合成音频演示核心流程。

**包含：**
- `audio_utils.py`：CQT 特征提取
- `model.py`：简化 CNN 特征提取网络
- `retrieval.py`：MaxMean 相似度 + 两阶段检索
- `demo.py`：完整演示脚本

**运行：**

```bash
cd bytecover3_demo
pip install numpy soundfile torch librosa matplotlib scikit-learn
python demo.py
```

> 注意：这是教学用简化版，使用合成数据和 64 维 embedding，与论文中的真实精度有差距。

---

### 3. `milvus_learning_site/` — Milvus 向量数据库交互式课程网站

基于 ByteCover3 网站模板构建，专门用于学习 Milvus 向量数据库。

**内容结构：**
- 导学：什么是向量数据库
- 第 1 章：向量与 Embedding
- 第 2 章：相似度度量（Cosine / Euclidean / IP）
- 第 3 章：ANN 与索引（FLAT / IVF / HNSW）
- 第 4 章：Milvus 核心概念（Collection / Entity / Field / Schema / Partition）
- 第 5 章：数据建模与写入
- 第 6 章：搜索与查询（search / query / 混合搜索）
- 第 7 章：部署与生态
- 第 8 章：真实案例与面试题
- 总结与延伸

**交互 Demo：**
- Embedding Explorer：观察 Top-K 最近邻
- Similarity Metrics：比较 Cosine / Euclidean / IP
- Index Comparison：FLAT / IVF / HNSW 对比
- Search Simulator：生成 PyMilvus 代码
- Collection Designer：设计 Schema 并生成代码

**如何打开：**

```bash
cd milvus_learning_site
python3 -m http.server 8080
```

然后访问 http://localhost:8080

详见 [`milvus_learning_site/README.md`](milvus_learning_site/README.md)。

---

## 学习建议

1. **先看网站**：按章节顺序阅读，配合交互 Demo 理解概念。
2. **再跑 Demo**：用 `bytecover3_demo` 动手实验，看代码如何对应论文流程。
3. **参考论文**：遇到细节问题时对照原始论文。

---

## 技术栈

| 模块 | 技术 |
|---|---|
| 课程网站 | HTML + CSS + 原生 JavaScript（无框架、无 CDN） |
| Python Demo | Python + PyTorch + librosa + scikit-learn |

---

## 离线使用

本项目没有任何外部 CDN 依赖，所有 CSS、JS、图片都是本地文件。把整个目录复制到任何地方，双击 `bytecover3_site/index.html` 或 `milvus_learning_site/index.html` 即可离线学习。

---

## 浏览器兼容性

- Chrome / Edge / Safari / Firefox 最新版本
- 移动端浏览器也可访问
- 支持亮色/暗色模式切换

---

## 参考资料

- 原始论文：`BYTECOVER3- ACCURATE COVER SONG IDENTIFICATION ON SHORT QUERIES.pdf`
