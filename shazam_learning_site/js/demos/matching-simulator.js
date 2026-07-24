/**
 * Demo: 匹配模拟器
 * 预置数据库歌曲和查询片段，展示时间偏移投票匹配过程。
 */

(function() {
    'use strict';

    const container = document.getElementById('matching-simulator-demo');
    if (!container) return;

    const TIME_BINS = 50;
    const FREQ_BINS = 32;
    const QUERY_OFFSET = 8;
    const TARGET_WINDOW = 5;
    const THRESHOLD = 0.58;

    const DB_SPECTROGRAM = SZUtils.generateSpectrogram(TIME_BINS, FREQ_BINS, 2024);
    const DB_PEAKS = SZUtils.findPeaks(DB_SPECTROGRAM, THRESHOLD, 1);
    const DB_HASHES = SZUtils.generateHashes(DB_PEAKS, TARGET_WINDOW);
    const DB_INDEX = SZUtils.buildIndex(DB_HASHES, 'song-A');

    // Query is a slice of the same spectrogram, shifted by QUERY_OFFSET
    const QUERY_START = 8;
    const QUERY_LENGTH = 18;
    const querySpectrogram = [];
    for (let t = 0; t < QUERY_LENGTH; t++) {
        const srcT = QUERY_START + t;
        querySpectrogram.push(DB_SPECTROGRAM[srcT] ? [...DB_SPECTROGRAM[srcT]] : DB_SPECTROGRAM[DB_SPECTROGRAM.length - 1]);
    }
    const QUERY_PEAKS = SZUtils.findPeaks(querySpectrogram, THRESHOLD, 1);
    const QUERY_HASHES = SZUtils.generateHashes(QUERY_PEAKS, TARGET_WINDOW);

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <button class="btn btn-primary" id="sz-run-match">运行匹配</button>
                <button class="btn btn-secondary" id="sz-reset-match">重置</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">数据库歌曲</div>
                    <canvas id="sz-db-canvas" class="demo-canvas" width="360" height="180"></canvas>
                </div>
                <div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">查询片段（起始于歌曲第 ${QUERY_START} 帧）</div>
                    <canvas id="sz-query-canvas" class="demo-canvas" width="360" height="180"></canvas>
                </div>
            </div>
            <div id="sz-histogram-container" style="display: none;">
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">时间偏移投票直方图</div>
                <canvas id="sz-histogram-canvas" class="demo-canvas" width="720" height="200"></canvas>
            </div>
            <div class="demo-output" id="sz-match-output">
                点击「运行匹配」查看 Shazam 如何通过时间偏移投票识别这段查询音频。
            </div>
        `;

        document.getElementById('sz-run-match').addEventListener('click', runMatch);
        document.getElementById('sz-reset-match').addEventListener('click', resetMatch);

        drawSpectrogram(document.getElementById('sz-db-canvas'), DB_PEAKS, TIME_BINS, FREQ_BINS, false);
        drawSpectrogram(document.getElementById('sz-query-canvas'), QUERY_PEAKS, QUERY_LENGTH, FREQ_BINS, true);
    }

    function drawSpectrogram(canvas, peaks, timeBins, freqBins, isQuery) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cellW = canvas.width / timeBins;
        const cellH = canvas.height / freqBins;

        // Background grid
        ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.3;
        for (let t = 0; t <= timeBins; t++) {
            ctx.beginPath();
            ctx.moveTo(t * cellW, 0);
            ctx.lineTo(t * cellW, canvas.height);
            ctx.stroke();
        }
        for (let f = 0; f <= freqBins; f++) {
            ctx.beginPath();
            ctx.moveTo(0, f * cellH);
            ctx.lineTo(canvas.width, f * cellH);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        // Peaks
        ctx.fillStyle = '#3b82f6';
        peaks.forEach(p => {
            const x = p.t * cellW + cellW / 2;
            const y = (freqBins - 1 - p.f) * cellH + cellH / 2;
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, Math.PI * 2);
            ctx.fill();
        });

        // Query marker
        if (!isQuery) {
            ctx.strokeStyle = '#F96167';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(QUERY_START * cellW, 0, QUERY_LENGTH * cellW, canvas.height);
            ctx.setLineDash([]);
        }
    }

    function runMatch() {
        const results = SZUtils.match(DB_INDEX, QUERY_HASHES);
        const histogramContainer = document.getElementById('sz-histogram-container');
        const output = document.getElementById('sz-match-output');

        histogramContainer.style.display = 'block';

        // Compute offset votes manually for histogram
        const offsetVotes = {};
        let totalMatches = 0;
        QUERY_HASHES.forEach(qh => {
            const entries = DB_INDEX[qh.hash];
            if (!entries) return;
            totalMatches += entries.length;
            entries.forEach(entry => {
                const offset = entry.time - qh.anchorT;
                const key = `${entry.songId}:${offset}`;
                if (!offsetVotes[key]) {
                    offsetVotes[key] = { songId: entry.songId, offset, count: 0 };
                }
                offsetVotes[key].count++;
            });
        });

        const votes = Object.values(offsetVotes).sort((a, b) => b.count - a.count);
        drawHistogram(votes);

        if (results.length > 0) {
            const top = results[0];
            output.innerHTML = `
                最佳匹配：<strong>${top.songId}</strong>，
                时间偏移：<strong>${top.offset}</strong> 帧，
                得票：<strong>${top.score}</strong>
                <br><span style="color: var(--text-secondary)">
                查询片段起始于歌曲第 ${QUERY_START} 帧，匹配得到的时间偏移为 ${top.offset} 帧，说明算法正确对齐了查询位置。
                ${top.offset !== QUERY_START ? '（存在少量偏差是正常的，因为峰值提取会受局部结构影响。）' : ''}
                </span>
            `;
        } else {
            output.innerHTML = '没有匹配结果。';
        }
    }

    function drawHistogram(votes) {
        const canvas = document.getElementById('sz-histogram-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (votes.length === 0) return;

        const maxCount = Math.max(...votes.map(v => v.count));
        const topVotes = votes.slice(0, Math.min(30, votes.length));
        const barW = Math.max(16, (canvas.width - 80) / topVotes.length);
        const chartH = canvas.height - 60;

        topVotes.forEach((v, i) => {
            const h = (v.count / maxCount) * chartH * 0.85;
            const x = 50 + i * barW;
            const y = canvas.height - 40 - h;

            ctx.fillStyle = i === 0 ? '#F96167' : '#3b82f6';
            SZUtils.roundRect(ctx, x, y, barW - 4, h, 4);
            ctx.fill();

            // Count label
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-primary').trim() || '#1e293b';
            ctx.font = '11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(v.count, x + (barW - 4) / 2, y - 6);

            // Offset label
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
            ctx.fillText(v.offset, x + (barW - 4) / 2, canvas.height - 20);
        });

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('offset = dbTime - queryTime', 10, 20);
    }

    function resetMatch() {
        document.getElementById('sz-histogram-container').style.display = 'none';
        document.getElementById('sz-match-output').innerHTML = '点击「运行匹配」查看 Shazam 如何通过时间偏移投票识别这段查询音频。';
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
