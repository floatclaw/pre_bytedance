/**
 * Demo: 哈希与倒排索引
 * 展示锚点峰如何与目标峰组合生成哈希，以及倒排索引的结构。
 */

(function() {
    'use strict';

    const container = document.getElementById('hash-index-demo');
    if (!container) return;

    const TIME_BINS = 36;
    const FREQ_BINS = 28;
    const TARGET_WINDOW = 5;
    const SPECTROGRAM = SZUtils.generateSpectrogram(TIME_BINS, FREQ_BINS, 77);
    const PEAKS = SZUtils.findPeaks(SPECTROGRAM, 0.6, 1);
    const HASHES = SZUtils.generateHashes(PEAKS, TARGET_WINDOW);

    let selectedAnchorIndex = 0;

    function init() {
        container.innerHTML = `
            <div class="demo-controls">
                <div class="demo-control-group">
                    <button class="btn btn-primary" id="sz-prev-anchor">上一个锚点</button>
                    <button class="btn btn-primary" id="sz-next-anchor">下一个锚点</button>
                    <span id="sz-anchor-info" style="font-size: 0.9rem; color: var(--text-secondary);"></span>
                </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                    <canvas id="sz-hash-canvas" class="demo-canvas" width="360" height="320"></canvas>
                </div>
                <div id="sz-index-panel" style="background: var(--bg-primary); border: 1px solid var(--border); border-radius: 12px; padding: 16px; font-family: monospace; font-size: 0.85rem; overflow-y: auto; max-height: 320px;">
                </div>
            </div>
            <div class="demo-output" id="sz-hash-output"></div>
        `;

        document.getElementById('sz-prev-anchor').addEventListener('click', () => {
            selectedAnchorIndex = (selectedAnchorIndex - 1 + PEAKS.length) % PEAKS.length;
            draw();
        });

        document.getElementById('sz-next-anchor').addEventListener('click', () => {
            selectedAnchorIndex = (selectedAnchorIndex + 1) % PEAKS.length;
            draw();
        });

        draw();
    }

    function draw() {
        const canvas = document.getElementById('sz-hash-canvas');
        const output = document.getElementById('sz-hash-output');
        const indexPanel = document.getElementById('sz-index-panel');
        const anchorInfo = document.getElementById('sz-anchor-info');
        if (!canvas || !output || !indexPanel) return;

        const ctx = canvas.getContext('2d');
        const anchor = PEAKS[selectedAnchorIndex];
        const relatedHashes = HASHES.filter(h => h.anchorT === anchor.t && h.anchorF === anchor.f);

        // Background
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cellW = canvas.width / TIME_BINS;
        const cellH = canvas.height / FREQ_BINS;

        // Draw all peaks as small dots
        ctx.fillStyle = '#94a3b8';
        PEAKS.forEach(p => {
            const x = p.t * cellW + cellW / 2;
            const y = (FREQ_BINS - 1 - p.f) * cellH + cellH / 2;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw anchor
        const ax = anchor.t * cellW + cellW / 2;
        const ay = (FREQ_BINS - 1 - anchor.f) * cellH + cellH / 2;
        ctx.fillStyle = '#F96167';
        ctx.beginPath();
        ctx.arc(ax, ay, 7, 0, Math.PI * 2);
        ctx.fill();

        // Draw target window boundary
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect((anchor.t + 1) * cellW, 0, (TARGET_WINDOW - 1) * cellW, canvas.height);
        ctx.setLineDash([]);

        // Draw connections to targets
        relatedHashes.forEach(h => {
            const target = PEAKS.find(p => p.t === h.anchorT + h.deltaT && p.f === h.targetF);
            if (!target) return;
            const tx = target.t * cellW + cellW / 2;
            const ty = (FREQ_BINS - 1 - target.f) * cellH + cellH / 2;

            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(tx, ty, 5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Labels
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
        ctx.font = '11px sans-serif';
        ctx.fillText('时间 →', canvas.width - 55, canvas.height - 8);
        ctx.save();
        ctx.translate(12, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('频率 →', 0, 0);
        ctx.restore();

        // Index panel
        const index = SZUtils.buildIndex(relatedHashes, 'song-A');
        let indexHtml = `<div style="margin-bottom: 12px; font-weight: bold; color: var(--accent);">倒排索引片段</div>`;
        if (relatedHashes.length === 0) {
            indexHtml += `<div style="color: var(--text-secondary);">该锚点附近没有目标峰。</div>`;
        } else {
            Object.entries(index).forEach(([hash, entries]) => {
                indexHtml += `
                    <div style="margin-bottom: 10px;">
                        <div style="color: var(--text-primary);">${hash}</div>
                        <div style="padding-left: 12px; color: var(--text-secondary);">→ ${entries.map(e => `{${e.songId}, t=${e.time}}`).join(', ')}</div>
                    </div>
                `;
            });
        }
        indexPanel.innerHTML = indexHtml;

        anchorInfo.textContent = `锚点 #${selectedAnchorIndex + 1}/${PEAKS.length}: (t=${anchor.t}, f=${anchor.f})`;

        output.innerHTML = `
            当前锚点生成 <strong>${relatedHashes.length}</strong> 个哈希。
            <br><span style="color: var(--text-secondary)">
            每个哈希格式为「锚点频率-目标频率-时间差」，存入倒排索引后可被查询快速命中。</span>
        `;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
