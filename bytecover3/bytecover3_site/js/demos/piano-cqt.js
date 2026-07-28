/**
 * 钢琴 → CQT 交互 Demo
 * 点击钢琴键播放音符并高亮 CQT bin
 */

(function() {
    'use strict';

    const PianoCQT = {
        audioCtx: null,
        activeNotes: new Set(),

        init() {
            const container = document.getElementById('piano-cqt-demo');
            if (!container) return;

            this.container = container;
            this.render();
            this.setupAudio();
        },

        setupAudio() {
            document.addEventListener('click', () => {
                if (!this.audioCtx) {
                    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (this.audioCtx.state === 'suspended') {
                    this.audioCtx.resume();
                }
            }, { once: true });
        },

        render() {
            const notes = [
                { name: 'C', freq: 261.63, type: 'white' },
                { name: 'C#', freq: 277.18, type: 'black', offset: 1 },
                { name: 'D', freq: 293.66, type: 'white' },
                { name: 'D#', freq: 311.13, type: 'black', offset: 2 },
                { name: 'E', freq: 329.63, type: 'white' },
                { name: 'F', freq: 349.23, type: 'white' },
                { name: 'F#', freq: 369.99, type: 'black', offset: 4 },
                { name: 'G', freq: 392.00, type: 'white' },
                { name: 'G#', freq: 415.30, type: 'black', offset: 5 },
                { name: 'A', freq: 440.00, type: 'white' },
                { name: 'A#', freq: 466.16, type: 'black', offset: 6 },
                { name: 'B', freq: 493.88, type: 'white' },
                { name: 'C5', freq: 523.25, type: 'white' }
            ];

            let html = `
                <div class="piano-container">
                    <div class="piano" id="piano-keys">
            `;

            let whiteKeyIndex = 0;
            notes.forEach(note => {
                if (note.type === 'white') {
                    html += `
                        <div class="piano-key" data-note="${note.name}" data-freq="${note.freq}"
                             style="left: ${whiteKeyIndex * 40}px;">
                            ${note.name}
                        </div>
                    `;
                    whiteKeyIndex++;
                }
            });

            // Black keys need absolute positioning
            notes.forEach(note => {
                if (note.type === 'black') {
                    const left = note.offset * 40 - 13;
                    html += `
                        <div class="piano-key black" data-note="${note.name}" data-freq="${note.freq}"
                             style="left: ${left}px;">
                            ${note.name}
                        </div>
                    `;
                }
            });

            html += `
                    </div>
                    <canvas id="piano-cqt-canvas" class="cqt-display"></canvas>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">
                        提示：黄色条是基频，浅色条是泛音。支持鼠标点击和触摸屏。
                    </div>
                </div>
            `;

            this.container.innerHTML = html;

            // Set piano width
            const pianoEl = document.getElementById('piano-keys');
            pianoEl.style.width = `${whiteKeyIndex * 40}px`;

            // Bind events
            pianoEl.querySelectorAll('.piano-key').forEach(key => {
                key.addEventListener('mousedown', (e) => this.playNote(e.target));
                key.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.playNote(e.target);
                });
            });

            this.canvas = document.getElementById('piano-cqt-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());

            this.drawCQT();
        },

        resizeCanvas() {
            if (!this.canvas) return;
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * 2;
            this.canvas.height = rect.height * 2;
            this.ctx.scale(2, 2);
            this.drawCQT();
        },

        playNote(key) {
            const freq = parseFloat(key.dataset.freq);
            const note = key.dataset.note;

            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            // Visual feedback
            key.classList.add('active');
            this.activeNotes.add(note);
            setTimeout(() => {
                key.classList.remove('active');
                this.activeNotes.delete(note);
            }, 200);

            // Play sound
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.value = freq;

            // Add harmonics
            const osc2 = this.audioCtx.createOscillator();
            const gain2 = this.audioCtx.createGain();
            osc2.type = 'sine';
            osc2.frequency.value = freq * 2;
            gain2.gain.value = 0.3;

            const osc3 = this.audioCtx.createOscillator();
            const gain3 = this.audioCtx.createGain();
            osc3.type = 'sine';
            osc3.frequency.value = freq * 3;
            gain3.gain.value = 0.15;

            const now = this.audioCtx.currentTime;
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

            osc.connect(gain);
            osc2.connect(gain2);
            osc3.connect(gain3);
            gain.connect(this.audioCtx.destination);
            gain2.connect(this.audioCtx.destination);
            gain3.connect(this.audioCtx.destination);

            osc.start(now);
            osc2.start(now);
            osc3.start(now);
            osc.stop(now + 0.5);
            osc2.stop(now + 0.5);
            osc3.stop(now + 0.5);

            this.drawCQT();
        },

        drawCQT() {
            if (!this.ctx || !this.canvas) return;

            const width = this.canvas.width / 2;
            const height = this.canvas.height / 2;
            const ctx = this.ctx;

            ctx.clearRect(0, 0, width, height);

            // Background
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--bg-primary').trim() || '#ffffff';
            ctx.fillRect(0, 0, width, height);

            // Draw bin grid (12 bins per octave, 3 octaves)
            const binsPerOctave = 12;
            const octaves = 3;
            const totalBins = binsPerOctave * octaves;
            const binWidth = width / totalBins;

            // Draw octave separators
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim() || '#e2e8f0';
            ctx.lineWidth = 1;
            for (let i = 0; i <= octaves; i++) {
                const x = i * binsPerOctave * binWidth;
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }

            // Draw active notes
            this.activeNotes.forEach(noteName => {
                const freq = this.getNoteFreq(noteName);
                if (freq) {
                    this.drawNoteBars(ctx, freq, binWidth, binsPerOctave, height, width);
                }
            });

            // Draw labels
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary').trim() || '#64748b';
            ctx.font = '12px sans-serif';
            ctx.textAlign = 'center';
            for (let i = 0; i < totalBins; i++) {
                const x = i * binWidth;
                const label = this.getBinLabel(i, binsPerOctave);
                if (i % binsPerOctave === 0 || i % binsPerOctave === 4 || i % binsPerOctave === 7) {
                    ctx.fillText(label, x + binWidth / 2, height - 8);
                }
            }
        },

        drawNoteBars(ctx, freq, binWidth, binsPerOctave, height, width) {
            const fMin = 130.81; // C3
            const bin = Math.round(binsPerOctave * Math.log2(freq / fMin));

            // Draw fundamental
            this.drawBar(ctx, bin, binWidth, height, 1.0);

            // Draw harmonics
            for (let h = 2; h <= 4; h++) {
                const harmonicBin = Math.round(binsPerOctave * Math.log2((freq * h) / fMin));
                if (harmonicBin * binWidth < width) {
                    this.drawBar(ctx, harmonicBin, binWidth, height, 0.4 / h);
                }
            }
        },

        drawBar(ctx, bin, binWidth, height, intensity) {
            const x = bin * binWidth;
            const barHeight = height * 0.7 * intensity;
            const y = height - barHeight - 25;

            const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, '#F9E795');
            gradient.addColorStop(1, '#F96167');

            ctx.fillStyle = gradient;
            ctx.fillRect(x + 2, y, binWidth - 4, barHeight);
        },

        getNoteFreq(noteName) {
            const map = {
                'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
                'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
                'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88,
                'C5': 523.25
            };
            return map[noteName];
        },

        getBinLabel(binIndex, binsPerOctave) {
            const labels = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
            return labels[binIndex % binsPerOctave];
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PianoCQT.init());
    } else {
        PianoCQT.init();
    }
})();
