/**
 * 两阶段检索模拟器
 */

(function() {
    'use strict';

    const RetrievalSimulator = {
        database: [],
        selectedQuery: 0,
        stage1Results: [],
        stage2Results: [],

        init() {
            const container = document.getElementById('retrieval-simulator-demo');
            if (!container) return;

            this.container = container;
            this.buildDatabase();
            this.render();
            this.runRetrieval();
        },

        buildDatabase() {
            // 4 synthetic songs, each with 6 chunks represented as 2D unit vectors
            const songs = [
                { id: 'song1', name: 'Song A: 上行音阶', color: '#3b82f6', centerAngle: 0.5 },
                { id: 'song2', name: 'Song B: 下行音阶', color: '#10b981', centerAngle: 2.0 },
                { id: 'song3', name: 'Song C: 跳跃旋律', color: '#f59e0b', centerAngle: 3.5 },
                { id: 'song4', name: 'Song D: 和声进行', color: '#8b5cf6', centerAngle: 5.0 }
            ];

            this.database = songs.map(song => {
                const chunks = [];
                for (let i = 0; i < 6; i++) {
                    const angle = song.centerAngle + i * 0.3 + (Math.random() - 0.5) * 0.2;
                    chunks.push(BCUtils.unitVectorAtAngle(2, angle));
                }
                return {
                    ...song,
                    chunks: chunks
                };
            });

            // Queries: short snippets from each song
            this.queries = this.database.map((song, idx) => ({
                id: `query_${idx}`,
                name: `${song.name} 的片段`,
                songIndex: idx,
                chunks: song.chunks.slice(1, 4) // 3 chunks
            }));
        },

        render() {
            let options = '';
            this.queries.forEach((q, idx) => {
                options += `<option value="${idx}"${idx === 0 ? ' selected' : ''}>${q.name}</option>`;
            });

            this.container.innerHTML = `
                <div class="demo-controls">
                    <div class="demo-control-group">
                        <label>查询片段：</label>
                        <select id="rs-query-select">${options}</select>
                    </div>
                    <div class="demo-control-group">
                        <label>Top-K：</label>
                        <select id="rs-topk-select">
                            <option value="3">3</option>
                            <option value="5" selected>5</option>
                            <option value="8">8</option>
                        </select>
                    </div>
                    <button class="btn btn-primary" id="rs-run-btn">运行检索</button>
                </div>

                <div class="retrieval-stats">
                    <div class="stat-box">
                        <div class="stat-value" id="rs-db-size">0</div>
                        <div class="stat-label">数据库 chunks</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="rs-stage1-calls">0</div>
                        <div class="stat-label">Stage1 比较次数</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="rs-stage2-calls">0</div>
                        <div class="stat-label">Stage2 比较次数</div>
                    </div>
                </div>

                <div class="retrieval-layout">
                    <div class="retrieval-panel">
                        <h4>Stage 1：ANN 粗排</h4>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">找到与查询 chunks 最相似的候选 chunks</p>
                        <div id="rs-stage1-results"></div>
                    </div>
                    <div class="retrieval-panel">
                        <h4>Stage 2：MaxMean 精排</div>
                        <p style="font-size: 0.9rem; color: var(--text-secondary);">对候选歌曲计算完整 MaxMean 并排序</p>
                        <div id="rs-stage2-results"></div>
                    </div>
                </div>
            `;

            document.getElementById('rs-run-btn').addEventListener('click', () => this.runRetrieval());
            document.getElementById('rs-query-select').addEventListener('change', (e) => {
                this.selectedQuery = parseInt(e.target.value);
                this.runRetrieval();
            });
            document.getElementById('rs-topk-select').addEventListener('change', () => this.runRetrieval());
        },

        runRetrieval() {
            const query = this.queries[this.selectedQuery];
            const topK = parseInt(document.getElementById('rs-topk-select').value);

            // Stage 1: For each query chunk, find top-K similar chunks across all songs
            const allChunks = [];
            this.database.forEach((song, songIdx) => {
                song.chunks.forEach((chunk, chunkIdx) => {
                    allChunks.push({
                        vector: chunk,
                        songIndex: songIdx,
                        chunkIndex: chunkIdx
                    });
                });
            });

            const stage1Matches = [];
            let stage1Calls = 0;

            query.chunks.forEach(qChunk => {
                const similarities = allChunks.map(item => {
                    stage1Calls++;
                    return {
                        ...item,
                        similarity: BCUtils.cosineSimilarity(qChunk, item.vector)
                    };
                });

                similarities.sort((a, b) => b.similarity - a.similarity);
                stage1Matches.push(...similarities.slice(0, topK));
            });

            // Get unique candidate songs
            const candidateSongIndices = [...new Set(stage1Matches.map(m => m.songIndex))];

            // Stage 2: Compute MaxMean for each candidate song
            let stage2Calls = 0;
            const stage2Results = candidateSongIndices.map(songIdx => {
                const song = this.database[songIdx];
                stage2Calls += query.chunks.length * song.chunks.length;
                return {
                    songIndex: songIdx,
                    song: song,
                    score: BCUtils.maxMean(query.chunks, song.chunks).score
                };
            });

            stage2Results.sort((a, b) => b.score - a.score);

            this.stage1Results = stage1Matches;
            this.stage2Results = stage2Results;

            // Update stats
            document.getElementById('rs-db-size').textContent = allChunks.length;
            document.getElementById('rs-stage1-calls').textContent = stage1Calls;
            document.getElementById('rs-stage2-calls').textContent = stage2Calls;

            this.renderStage1();
            this.renderStage2();
        },

        renderStage1() {
            const container = document.getElementById('rs-stage1-results');

            // Group by song
            const bySong = {};
            this.stage1Results.forEach(match => {
                if (!bySong[match.songIndex]) {
                    bySong[match.songIndex] = [];
                }
                bySong[match.songIndex].push(match);
            });

            let html = '';
            Object.keys(bySong).sort().forEach(songIdx => {
                const song = this.database[songIdx];
                const matches = bySong[songIdx];
                const avgScore = matches.reduce((s, m) => s + m.similarity, 0) / matches.length;

                html += `
                    <div style="margin-bottom: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid ${song.color};">
                        <div style="font-weight: 600; color: var(--text-primary);">${song.name}</div>
                        <div style="font-size: 0.85rem; color: var(--text-secondary);">
                            ${matches.length} 个 chunk 匹配，平均相似度 ${avgScore.toFixed(3)}
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html || '<p style="color: var(--text-secondary);">无候选结果</p>';
        },

        renderStage2() {
            const container = document.getElementById('rs-stage2-results');
            const querySongIdx = this.queries[this.selectedQuery].songIndex;

            let html = '';
            this.stage2Results.forEach((result, rank) => {
                const isCorrect = result.songIndex === querySongIdx;
                const badge = isCorrect ? '✓ 正确答案' : `#${rank + 1}`;

                html += `
                    <div style="margin-bottom: 12px; padding: 12px; background: var(--bg-secondary); border-radius: 8px; border-left: 4px solid ${result.song.color};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600; color: var(--text-primary);">${result.song.name}</span>
                            <span style="font-size: 0.8rem; padding: 2px 8px; border-radius: 10px; background: ${isCorrect ? 'var(--success)' : 'var(--accent-light)'}; color: ${isCorrect ? '#fff' : 'var(--accent-dark)'};">${badge}</span>
                        </div>
                        <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 4px;">
                            MaxMean 相似度：<strong>${result.score.toFixed(3)}</strong>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => RetrievalSimulator.init());
    } else {
        RetrievalSimulator.init();
    }
})();
