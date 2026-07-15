/**
 * CQT 可视化器
 * 合成音频并实时显示波形、线性频谱、简化 CQT
 */

(function() {
    'use strict';

    const CQTVisualizer = {
        audioCtx: null,
        analyser: null,
        oscillator: null,
        isPlaying: false,
        animationId: null,
        currentNoteIndex: 0,
        noteStartTime: 0,

        presets: {
            'scale': {
                name: 'C 大调音阶',
                notes: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25],
                duration: 0.4
            },
            'arpeggio': {
                name: 'C-E-G 琶音',
                notes: [261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63],
                duration: 0.5
            },
            'jump': {
                name: '跳跃旋律',
                notes: [261.63, 392.00, 329.63, 523.25, 349.23, 440.00],
                duration: 0.45
            }
        },

        init() {
            const container = document.getElementById('cqt-visualizer-demo');
            if (!container) return;

            this.container = container;
            this.currentPreset = 'arpeggio';
            this.render();
            this.setupCanvases();
        },

        render() {
            let options = '';
            Object.keys(this.presets).forEach(key => {
                const selected = key === this.currentPreset ? 'selected' : '';
                options += `<option value="${key}" ${selected}>${this.presets[key].name}</option>`;
            });

            this.container.innerHTML = `
                <div class="demo-controls">
                    <div class="demo-control-group">
                        <label>预设旋律：</label>
                        <select id="cqv-preset">${options}</select>
                    </div>
                    <button class="btn btn-primary" id="cqv-play-btn">▶ 播放并可视化</button>
                    <button class="btn btn-secondary" id="cqv-stop-btn">⏹ 停止</button>
                </div>

                <div style="display: grid; gap: 16px;">
                    <div class="demo-panel" style="background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 0.95rem;">波形</h4>
                        <canvas id="cqv-waveform" style="width: 100%; height: 80px; background: #0f172a; border-radius: 4px;"></canvas>
                    </div>
                    <div class="demo-panel" style="background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 0.95rem;">线性频谱</h4>
                        <canvas id="cqv-spectrum" style="width: 100%; height: 120px; background: #0f172a; border-radius: 4px;"></canvas>
                    </div>
                    <div class="demo-panel" style="background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; padding: 12px;">
                        <h4 style="margin: 0 0 8px 0; font-size: 0.95rem;">简化 CQT</h4>
                        <canvas id="cqv-cqt" style="width: 100%; height: 160px; background: #0f172a; border-radius: 4px;"></canvas>
                    </div>
                </div>

                <div class="demo-output" id="cqv-output">
                    点击"播放并可视化"开始。这是一个浏览器简化版 CQT，仅用于直观理解。
                </div>
            `;

            document.getElementById('cqv-preset').addEventListener('change', (e) => {
                this.currentPreset = e.target.value;
            });
            document.getElementById('cqv-play-btn').addEventListener('click', () => this.play());
            document.getElementById('cqv-stop-btn').addEventListener('click', () => this.stop());
        },

        setupCanvases() {
            this.waveCanvas = document.getElementById('cqv-waveform');
            this.specCanvas = document.getElementById('cqv-spectrum');
            this.cqtCanvas = document.getElementById('cqv-cqt');

            [this.waveCanvas, this.specCanvas, this.cqtCanvas].forEach(canvas => {
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width * 2;
                canvas.height = rect.height * 2;
            });
        },

        play() {
            if (this.isPlaying) this.stop();

            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 2048;
            this.analyser.connect(this.audioCtx.destination);

            this.isPlaying = true;
            this.currentNoteIndex = 0;
            this.noteStartTime = this.audioCtx.currentTime;
            this.playNextNote();
            this.visualize();
        },

        playNextNote() {
            if (!this.isPlaying) return;

            const preset = this.presets[this.currentPreset];
            if (this.currentNoteIndex >= preset.notes.length) {
                this.currentNoteIndex = 0;
                this.noteStartTime = this.audioCtx.currentTime;
            }

            const freq = preset.notes[this.currentNoteIndex];
            const duration = preset.duration;

            // Create oscillator with envelope
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;

            const now = this.audioCtx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.01, now + duration - 0.05);

            osc.connect(gain);
            gain.connect(this.analyser);
            osc.start(now);
            osc.stop(now + duration);

            // Add harmonics
            for (let h = 2; h <= 3; h++) {
                const oscH = this.audioCtx.createOscillator();
                const gainH = this.audioCtx.createGain();
                oscH.type = 'sine';
                oscH.frequency.value = freq * h;
                gainH.gain.value = 0.1 / h;
                oscH.connect(gainH);
                gainH.connect(this.analyser);
                oscH.start(now);
                oscH.stop(now + duration);
            }

            this.currentNoteIndex++;

            setTimeout(() => this.playNextNote(), duration * 1000);
        },

        stop() {
            this.isPlaying = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
        },

        visualize() {
            if (!this.isPlaying) return;

            const bufferLength = this.analyser.frequencyBinCount;
            const timeData = new Uint8Array(this.analyser.fftSize);
            const freqData = new Uint8Array(bufferLength);

            this.analyser.getByteTimeDomainData(timeData);
            this.analyser.getByteFrequencyData(freqData);

            this.drawWaveform(timeData);
            this.drawSpectrum(freqData);
            this.drawCQT(freqData);

            this.animationId = requestAnimationFrame(() => this.visualize());
        },

        drawWaveform(data) {
            if (!this.waveCanvas) return;
            const ctx = this.waveCanvas.getContext('2d');
            const width = this.waveCanvas.width / 2;
            const height = this.waveCanvas.height / 2;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            ctx.lineWidth = 2;
            ctx.strokeStyle = '#60a5fa';
            ctx.beginPath();

            const sliceWidth = width / data.length;
            let x = 0;

            for (let i = 0; i < data.length; i++) {
                const v = data[i] / 128.0;
                const y = v * height / 2;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            ctx.stroke();
        },

        drawSpectrum(data) {
            if (!this.specCanvas) return;
            const ctx = this.specCanvas.getContext('2d');
            const width = this.specCanvas.width / 2;
            const height = this.specCanvas.height / 2;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            const barCount = 64;
            const barWidth = width / barCount;

            for (let i = 0; i < barCount; i++) {
                const start = Math.floor(i * data.length / barCount);
                const end = Math.floor((i + 1) * data.length / barCount);
                let sum = 0;
                for (let j = start; j < end; j++) {
                    sum += data[j];
                }
                const avg = sum / (end - start);
                const barHeight = (avg / 255) * height;

                const hue = 240 - (i / barCount) * 120;
                ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
                ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
            }
        },

        drawCQT(data) {
            if (!this.cqtCanvas) return;
            const ctx = this.cqtCanvas.getContext('2d');
            const width = this.cqtCanvas.width / 2;
            const height = this.cqtCanvas.height / 2;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, width, height);

            const sampleRate = this.audioCtx.sampleRate;
            const nyquist = sampleRate / 2;
            const fMin = 65.41; // C2
            const fMax = 2093.0; // C7
            const binsPerOctave = 12;
            const totalBins = Math.floor(binsPerOctave * Math.log2(fMax / fMin));
            const binWidth = width / totalBins;

            // Accumulate FFT energy into CQT bins
            const cqtBins = new Array(totalBins).fill(0);

            for (let i = 0; i < data.length; i++) {
                const freq = (i / data.length) * nyquist;
                if (freq < fMin || freq > fMax) continue;

                const bin = Math.floor(binsPerOctave * Math.log2(freq / fMin));
                if (bin >= 0 && bin < totalBins) {
                    cqtBins[bin] += data[i];
                }
            }

            // Normalize
            const maxVal = Math.max(...cqtBins, 1);
            for (let i = 0; i < totalBins; i++) {
                const intensity = cqtBins[i] / maxVal;
                const barHeight = intensity * height * 0.9;

                const hue = 280 - intensity * 120;
                ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.3 + intensity * 0.7})`;
                ctx.fillRect(i * binWidth, height - barHeight, binWidth - 1, barHeight);
            }

            // Draw octave separators
            ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ctx.lineWidth = 1;
            for (let octave = 0; octave <= 5; octave++) {
                const x = octave * binsPerOctave * binWidth;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CQTVisualizer.init());
    } else {
        CQTVisualizer.init();
    }
})();
