/**
 * Milvus 学习网站通用工具函数
 */

const MVUtils = {
    /**
     * 计算两个向量的点积
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number}
     */
    dotProduct(a, b) {
        return a.reduce((sum, val, i) => sum + val * b[i], 0);
    },

    /**
     * 计算向量的 L2 范数
     * @param {number[]} v
     * @returns {number}
     */
    norm(v) {
        return Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
    },

    /**
     * 计算余弦相似度
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number}
     */
    cosineSimilarity(a, b) {
        const dot = this.dotProduct(a, b);
        const normA = this.norm(a);
        const normB = this.norm(b);
        if (normA === 0 || normB === 0) return 0;
        return dot / (normA * normB);
    },

    /**
     * 计算欧氏距离
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number}
     */
    euclideanDistance(a, b) {
        return Math.sqrt(a.reduce((sum, x, i) => sum + (x - b[i]) ** 2, 0));
    },

    /**
     * 计算内积（Inner Product）
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number}
     */
    innerProduct(a, b) {
        return this.dotProduct(a, b);
    },

    /**
     * 向量归一化
     * @param {number[]} v
     * @returns {number[]}
     */
    normalize(v) {
        const n = this.norm(v);
        if (n === 0) return v;
        return v.map(x => x / n);
    },

    /**
     * 根据 metric 计算相似度/距离
     * @param {number[]} a
     * @param {number[]} b
     * @param {string} metric 'cosine' | 'euclidean' | 'ip'
     * @returns {number}
     */
    distance(a, b, metric = 'cosine') {
        switch (metric) {
            case 'cosine':
                return this.cosineSimilarity(a, b);
            case 'euclidean':
                return this.euclideanDistance(a, b);
            case 'ip':
                return this.innerProduct(a, b);
            default:
                return this.cosineSimilarity(a, b);
        }
    },

    /**
     * 对向量按 metric 排序，返回索引
     * @param {number[]} query
     * @param {number[][]} candidates
     * @param {string} metric
     * @param {boolean} ascending 距离越小越近则为 true
     * @returns {number[]}
     */
    rank(query, candidates, metric = 'cosine', ascending = false) {
        const scores = candidates.map((v, i) => ({ i, score: this.distance(query, v, metric) }));
        scores.sort((x, y) => ascending ? x.score - y.score : y.score - x.score);
        return scores.map(s => s.i);
    },

    /**
     * 生成指定数量的随机单位向量
     * @param {number} count
     * @param {number} dim
     * @returns {number[][]}
     */
    randomUnitVectors(count, dim) {
        const vectors = [];
        for (let i = 0; i < count; i++) {
            const v = [];
            for (let d = 0; d < dim; d++) {
                v.push((Math.random() - 0.5) * 2);
            }
            const norm = this.norm(v);
            vectors.push(v.map(x => x / (norm || 1)));
        }
        return vectors;
    },

    /**
     * 创建具有特定方向的单位向量
     * @param {number} dim 维度
     * @param {number} angle 角度（弧度，用于 2D）
     * @returns {number[]}
     */
    unitVectorAtAngle(dim, angle) {
        if (dim === 2) {
            return [Math.cos(angle), Math.sin(angle)];
        }
        const v = new Array(dim).fill(0);
        v[0] = Math.cos(angle);
        v[1] = Math.sin(angle);
        return v;
    },

    /**
     * 将一组向量围绕一个中心方向聚集
     * @param {number} count 向量数量
     * @param {number} dim 维度
     * @param {number} centerAngle 中心角度
     * @param {number} spread 散布范围
     * @returns {number[][]}
     */
    clusteredVectors(count, dim, centerAngle, spread = 0.3) {
        const vectors = [];
        for (let i = 0; i < count; i++) {
            const angle = centerAngle + (Math.random() - 0.5) * spread;
            vectors.push(this.unitVectorAtAngle(dim, angle));
        }
        return vectors;
    },

    /**
     * 生成多簇向量数据
     * @param {number} clusters 簇数
     * @param {number} perCluster 每簇数量
     * @param {number} dim 维度
     * @param {number} spread 散布范围
     * @returns {{vectors: number[][], labels: number[]}}
     */
    generateClusters(clusters, perCluster, dim, spread = 0.4) {
        const vectors = [];
        const labels = [];
        for (let c = 0; c < clusters; c++) {
            const centerAngle = (c / clusters) * 2 * Math.PI;
            const cluster = this.clusteredVectors(perCluster, dim, centerAngle, spread);
            vectors.push(...cluster);
            labels.push(...Array(perCluster).fill(c));
        }
        return { vectors, labels };
    },

    /**
     * 绘制圆角矩形
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} w
     * @param {number} h
     * @param {number} r
     */
    roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
};

// 兼容 CommonJS 和浏览器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MVUtils;
}
