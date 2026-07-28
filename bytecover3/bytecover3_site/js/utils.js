/**
 * ByteCover3 课程网站通用工具函数
 */

const BCUtils = {
    /**
     * 将频率映射到 CQT bin 索引
     * @param {number} f 频率 (Hz)
     * @param {number} fMin 最低频率 (默认 27.5 Hz, A0)
     * @param {number} binsPerOctave 每八度 bin 数 (默认 12)
     * @returns {number} bin 索引
     */
    freqToCQTBin(f, fMin = 27.5, binsPerOctave = 12) {
        if (f <= 0) return -1;
        return Math.round(binsPerOctave * Math.log2(f / fMin));
    },

    /**
     * 将 CQT bin 索引映射回频率
     * @param {number} bin bin 索引
     * @param {number} fMin 最低频率
     * @param {number} binsPerOctave 每八度 bin 数
     * @returns {number} 频率 (Hz)
     */
    cqtBinToFreq(bin, fMin = 27.5, binsPerOctave = 12) {
        return fMin * Math.pow(2, bin / binsPerOctave);
    },

    /**
     * 计算两个向量的余弦相似度
     * @param {number[]} a
     * @param {number[]} b
     * @returns {number}
     */
    cosineSimilarity(a, b) {
        let dot = 0, normA = 0, normB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    },

    /**
     * 计算 MaxMean 相似度
     * @param {number[][]} query 查询局部特征数组
     * @param {number[][]} candidate 候选局部特征数组
     * @returns {{score: number, maxIndices: number[]}}
     */
    maxMean(query, candidate) {
        const maxIndices = [];
        let sum = 0;

        for (let i = 0; i < query.length; i++) {
            let best = -Infinity;
            let bestIdx = -1;
            for (let j = 0; j < candidate.length; j++) {
                const sim = this.cosineSimilarity(query[i], candidate[j]);
                if (sim > best) {
                    best = sim;
                    bestIdx = j;
                }
            }
            maxIndices.push(bestIdx);
            sum += best;
        }

        return {
            score: sum / query.length,
            maxIndices: maxIndices
        };
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
            const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0));
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
     * 音符名称到频率的映射（C4 = 261.63 Hz）
     * @param {string} note 音符名称，如 "C4", "A4"
     * @returns {number} 频率
     */
    noteToFreq(note) {
        const noteMap = {
            'C': -9, 'C#': -8, 'Db': -8,
            'D': -7, 'D#': -6, 'Eb': -6,
            'E': -5, 'F': -4, 'F#': -3, 'Gb': -3,
            'G': -2, 'G#': -1, 'Ab': -1,
            'A': 0, 'A#': 1, 'Bb': 1,
            'B': 2
        };

        const match = note.match(/^([A-G][#b]?)(\d+)$/);
        if (!match) return 440;

        const name = match[1];
        const octave = parseInt(match[2]);
        const semitones = noteMap[name] + (octave - 4) * 12;

        return 440 * Math.pow(2, semitones / 12);
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
    module.exports = BCUtils;
}
