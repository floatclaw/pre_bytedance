/**
 * Shazam 学习网站通用工具函数
 */

const SZUtils = {
    /**
     * 生成 0-1 之间的伪随机数（可种子）
     * @param {number} seed
     * @returns {number}
     */
    seededRandom(seed) {
        const x = Math.sin(seed * 9999) * 10000;
        return x - Math.floor(x);
    },

    /**
     * 生成简化的频谱图数据（时间 × 频率）
     * @param {number} timeBins 时间帧数
     * @param {number} freqBins 频率 bin 数
     * @param {number} seed 随机种子
     * @returns {number[][]}
     */
    generateSpectrogram(timeBins, freqBins, seed = 1) {
        const data = [];
        for (let t = 0; t < timeBins; t++) {
            const frame = [];
            for (let f = 0; f < freqBins; f++) {
                // 基础噪声
                let val = this.seededRandom(t * 100 + f + seed) * 0.3;
                // 添加几个"音符"条带
                const note1 = Math.sin(t * 0.3 + f * 0.2) > 0.7 ? 0.6 : 0;
                const note2 = Math.sin(t * 0.5 + f * 0.15 + 2) > 0.75 ? 0.5 : 0;
                const note3 = Math.sin(t * 0.2 + f * 0.25 + 4) > 0.8 ? 0.55 : 0;
                val += note1 + note2 + note3;
                frame.push(Math.min(1, val));
            }
            data.push(frame);
        }
        return data;
    },

    /**
     * 从 2D 频谱图中找局部最大值（峰值）
     * @param {number[][]} spectrogram
     * @param {number} threshold 能量阈值 0-1
     * @param {number} neighborhood 邻域大小
     * @returns {{t: number, f: number, energy: number}[]}
     */
    findPeaks(spectrogram, threshold = 0.6, neighborhood = 1) {
        const peaks = [];
        const T = spectrogram.length;
        const F = spectrogram[0]?.length || 0;

        for (let t = neighborhood; t < T - neighborhood; t++) {
            for (let f = neighborhood; f < F - neighborhood; f++) {
                const val = spectrogram[t][f];
                if (val < threshold) continue;

                let isMax = true;
                for (let dt = -neighborhood; dt <= neighborhood; dt++) {
                    for (let df = -neighborhood; df <= neighborhood; df++) {
                        if (dt === 0 && df === 0) continue;
                        if (spectrogram[t + dt][f + df] >= val) {
                            isMax = false;
                            break;
                        }
                    }
                    if (!isMax) break;
                }

                if (isMax) {
                    peaks.push({ t, f, energy: val });
                }
            }
        }
        return peaks;
    },

    /**
     * 把峰值列表转换成 anchor-target 哈希对
     * Shazam 风格：对每个 anchor，找它附近时间窗口内的 target 峰
     * @param {{t: number, f: number}[]} peaks
     * @param {number} targetWindow 目标峰时间窗口
     * @returns {{anchorT: number, anchorF: number, targetF: number, deltaT: number, hash: string}[]}
     */
    generateHashes(peaks, targetWindow = 5) {
        const hashes = [];
        peaks.sort((a, b) => a.t - b.t || a.f - b.f);

        for (let i = 0; i < peaks.length; i++) {
            const anchor = peaks[i];
            for (let j = i + 1; j < peaks.length; j++) {
                const target = peaks[j];
                const deltaT = target.t - anchor.t;
                if (deltaT <= 0 || deltaT > targetWindow) continue;

                const hash = `${anchor.f}-${target.f}-${deltaT}`;
                hashes.push({
                    anchorT: anchor.t,
                    anchorF: anchor.f,
                    targetF: target.f,
                    deltaT,
                    hash
                });
            }
        }
        return hashes;
    },

    /**
     * 建立倒排索引：hash → [{songId, time}]
     * @param {{hash: string, anchorT: number}[]} hashes
     * @param {string} songId
     * @returns {Object}
     */
    buildIndex(hashes, songId) {
        const index = {};
        hashes.forEach(h => {
            if (!index[h.hash]) index[h.hash] = [];
            index[h.hash].push({ songId, time: h.anchorT });
        });
        return index;
    },

    /**
     * 匹配查询指纹与数据库索引
     * @param {Object} dbIndex
     * @param {{hash: string, anchorT: number}[]} queryHashes
     * @returns {{songId: string, score: number, offset: number}[]}
     */
    match(dbIndex, queryHashes) {
        const offsetVotes = {};

        queryHashes.forEach(qh => {
            const entries = dbIndex[qh.hash];
            if (!entries) return;
            entries.forEach(entry => {
                const offset = entry.time - qh.anchorT;
                const key = `${entry.songId}:${offset}`;
                if (!offsetVotes[key]) {
                    offsetVotes[key] = { songId: entry.songId, offset, count: 0 };
                }
                offsetVotes[key].count++;
            });
        });

        const results = Object.values(offsetVotes)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        return results.map(r => ({
            songId: r.songId,
            score: r.count,
            offset: r.offset
        }));
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
    module.exports = SZUtils;
}
