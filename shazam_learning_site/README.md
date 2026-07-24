# Shazam 音频指纹学习网站

一个完全静态、可离线使用的 Shazam 音频指纹交互式学习网站，无需后端和外部 CDN。

---

## 内容结构

- 导学：什么是音频指纹
- 第 1 章：音频基础（波形、采样率、时频图、STFT）
- 第 2 章：频谱峰值（为什么只保留局部能量最大点）
- 第 3 章：Landmark 指纹与星座图
- 第 4 章：哈希与倒排索引（锚点-目标峰对组合）
- 第 5 章：匹配原理（时间偏移投票）
- 第 6 章：Shazam 完整流程
- 第 7 章：优缺点与边界（与神经网络方法对比）
- 第 8 章：真实案例与面试题（听歌识曲、广告监测、版权保护）
- 总结与延伸

---

## 交互 Demo

- **频谱峰值提取器**：拖动阈值，观察时频图中哪些格子成为峰值
- **星座图可视化**：在时频平面上查看 landmark 分布，加入噪声观察鲁棒性
- **哈希与倒排索引**：选择锚点峰，看如何生成（频率，频率，时间差）哈希
- **匹配模拟器**：预置数据库歌曲与查询片段，体验时间偏移投票匹配

---

## 如何打开

### 方式 1：本地 HTTP 服务器（推荐）

```bash
cd shazam_learning_site
python3 -m http.server 8080
```

然后访问 http://localhost:8080

### 方式 2：直接离线打开

双击 `index.html`，无需联网即可学习。

---

## 文件结构

```
shazam_learning_site/
├── index.html                  # 主页面
├── css/                        # 样式文件
│   ├── base.css
│   ├── components.css
│   ├── demos.css
│   └── animations.css
├── js/
│   ├── main.js                 # 主题、导航、进度
│   ├── utils.js                # 频谱生成、峰值提取、哈希、索引、匹配工具
│   ├── quiz.js                 # 章节测验引擎
│   ├── cases.js                # 真实案例与面试题渲染
│   └── demos/                  # 交互 Demo
│       ├── spectrogram-peaks.js
│       ├── landmark-map.js
│       ├── hash-index.js
│       └── matching-simulator.js
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

- Shazam 原始论文：《An Industrial-Strength Audio Search Algorithm》（Avery Li-Chun Wang, 2003）
