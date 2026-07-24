/**
 * Shazam 音频指纹课程测验系统
 */

const SZQuizData = {
    "chapter1": {
        "title": "第 1 章测验",
        "questions": [
            {
                "id": "c1q1",
                "type": "mcq",
                "question": "音频指纹的核心目标是什么？",
                "options": [
                    "把音频文件压缩到最小",
                    "用一段很短的音频片段快速识别出对应的歌曲",
                    "提高音乐播放音质",
                    "把音频转成文字歌词"
                ],
                "answer": 1,
                "explanation": "音频指纹的目标是从嘈杂、短小的录音片段中，快速在数据库里找到它属于哪首歌。"
            },
            {
                "id": "c1q2",
                "type": "mcq",
                "question": "Shazam 做指纹时，第一步通常把音频转成什么表示？",
                "options": [
                    "MIDI 乐谱",
                    "波形采样点序列",
                    "时频图（spectrogram）",
                    "MP3 编码帧"
                ],
                "answer": 2,
                "explanation": "Shazam 先把音频分帧做 STFT，得到时间-频率的时频图，再从中提取能量峰值。"
            },
            {
                "id": "c1q3",
                "type": "tf",
                "question": "采样率越高，单位时间内捕获的音频样本点就越多。",
                "answer": true,
                "explanation": "采样率表示每秒采多少个点，44.1kHz 就是每秒 44100 个样本。"
            },
            {
                "id": "c1q4",
                "type": "mcq",
                "question": "时频图的横轴和纵轴通常分别代表什么？",
                "options": [
                    "频率、时间",
                    "时间、频率",
                    "音量、时间",
                    "声道、频率"
                ],
                "answer": 1,
                "explanation": "时频图横轴是时间，纵轴是频率，颜色/亮度表示该时刻各频率的能量强弱。"
            }
        ]
    },
    "chapter2": {
        "title": "第 2 章测验",
        "questions": [
            {
                "id": "c2q1",
                "type": "mcq",
                "question": "Shazam 为什么选择「频谱能量峰值」作为指纹基础？",
                "options": [
                    "峰值点数量最多，信息最丰富",
                    "峰值对噪声、压缩、失真有较强鲁棒性",
                    "峰值计算最复杂，能体现算法先进性",
                    "峰值可以无损还原原始音频"
                ],
                "answer": 1,
                "explanation": "能量峰在噪声中仍然容易被检测到，即使部分峰值丢失，整体模式仍能匹配。"
            },
            {
                "id": "c2q2",
                "type": "mcq",
                "question": "找局部最大值时，邻域（neighborhood）参数的作用是？",
                "options": [
                    "控制窗口大小",
                    "决定只保留比周围格子都高的峰值",
                    "限制峰值的最小频率",
                    "决定使用哪个 FFT 算法"
                ],
                "answer": 1,
                "explanation": "邻域表示在时间和频率方向上各看多少格，只保留该局部区域内能量最高的点。"
            },
            {
                "id": "c2q3",
                "type": "tf",
                "question": "提高能量阈值会让检测到的峰值点变少。",
                "answer": true,
                "explanation": "阈值越高，只有能量足够强的点才能通过，峰值数量自然减少。"
            },
            {
                "id": "c2q4",
                "type": "mcq",
                "question": "只保留峰值而忽略大部分频谱信息，有什么好处？",
                "options": [
                    "完全不会丢失信息",
                    "大幅减少数据量，同时保留关键结构",
                    "让音质变得更好",
                    "消除所有背景噪声"
                ],
                "answer": 1,
                "explanation": "峰值是频谱的稀疏表示，数据量小、检索快，且对失真鲁棒。"
            }
        ]
    },
    "chapter3": {
        "title": "第 3 章测验",
        "questions": [
            {
                "id": "c3q1",
                "type": "mcq",
                "question": "Landmark（地标）指纹为什么被比作「星座图」？",
                "options": [
                    "因为峰值点像星星一样在时频平面上稀疏分布",
                    "因为需要用到天文算法",
                    "因为每首歌的指纹都画成五角星",
                    "因为峰值必须连成特定几何形状"
                ],
                "answer": 0,
                "explanation": "提取出的峰值在时频平面上稀疏分布，整体形态像星空/星座，所以叫 constellation map。"
            },
            {
                "id": "c3q2",
                "type": "mcq",
                "question": "星座图对噪声鲁棒的本质原因是什么？",
                "options": [
                    "噪声会增加很多峰值",
                    "噪声不会系统性地改变最强峰的位置",
                    "星座图包含完整频谱",
                    "峰值只在低频出现"
                ],
                "answer": 1,
                "explanation": "随机噪声可能新增少量伪峰，但原有强峰的位置基本不变，整体模式仍能匹配。"
            },
            {
                "id": "c3q3",
                "type": "tf",
                "question": "一首歌的 landmark 指纹就是它在时频图上的全部峰值点集合。",
                "answer": true,
                "explanation": " landmark 指纹通常就是时频图中提取出的峰值点（时间、频率）集合。"
            }
        ]
    },
    "chapter4": {
        "title": "第 4 章测验",
        "questions": [
            {
                "id": "c4q1",
                "type": "mcq",
                "question": "Shazam 如何把一个峰值组合编码成哈希？",
                "options": [
                    "只记录峰值的时间",
                    "用锚点峰和配对峰的频率+时间差拼接",
                    "把两个峰的能量相加",
                    "记录峰值的颜色"
                ],
                "answer": 1,
                "explanation": "典型组合是（锚点频率，目标频率，时间差），三者拼接成一个字符串哈希。"
            },
            {
                "id": "c4q2",
                "type": "mcq",
                "question": "哈希的主要作用是什么？",
                "options": [
                    "让音频听起来更好",
                    "把复杂的峰值关系压缩成可快速查找的键",
                    "减少歌曲的存储空间",
                    "加密音频内容"
                ],
                "answer": 1,
                "explanation": "哈希把局部峰对结构编码成固定键，便于在倒排索引中快速检索。"
            },
            {
                "id": "c4q3",
                "type": "tf",
                "question": "同一个锚点峰只能和一个目标峰组成哈希。",
                "answer": false,
                "explanation": "一个锚点可以在时间窗口内与多个目标峰分别组合，生成多个哈希。"
            },
            {
                "id": "c4q4",
                "type": "mcq",
                "question": "目标时间窗口 targetWindow 设置得太大会导致？",
                "options": [
                    "哈希数量变少",
                    "匹配速度变快",
                    "哈希数量暴增，索引变大",
                    "音质下降"
                ],
                "answer": 2,
                "explanation": "窗口越大，每个锚点能配对的峰越多，生成的哈希越多，索引和匹配开销都增大。"
            }
        ]
    },
    "chapter5": {
        "title": "第 5 章测验",
        "questions": [
            {
                "id": "c5q1",
                "type": "mcq",
                "question": "Shazam 使用什么数据结构来存储歌曲指纹？",
                "options": [
                    "二叉搜索树",
                    "倒排索引：hash → 歌曲ID+时间列表",
                    "关系型数据库表",
                    "链表的链表"
                ],
                "answer": 1,
                "explanation": "倒排索引把哈希值映射到出现过的（歌曲ID, 时间戳）列表，查询时极快。"
            },
            {
                "id": "c5q2",
                "type": "mcq",
                "question": "倒排索引中，同一个 hash 可能对应多个条目，原因是？",
                "options": [
                    "索引出错了",
                    "不同歌曲可能在局部有相似峰对结构",
                    "哈希函数总是冲突",
                    "时间戳重复"
                ],
                "answer": 1,
                "explanation": "不同歌曲可能偶然出现相同的（f1, f2, deltaT）组合，导致同一 hash 对应多条记录。"
            },
            {
                "id": "c5q3",
                "type": "tf",
                "question": "倒排索引让「给定一个哈希，快速找到所有出现位置」成为可能。",
                "answer": true,
                "explanation": "这正是倒排索引的核心作用：O(1) 或 O(log n) 查找 hash 对应的所有条目。"
            }
        ]
    },
    "chapter6": {
        "title": "第 6 章测验",
        "questions": [
            {
                "id": "c6q1",
                "type": "mcq",
                "question": "匹配查询片段时，Shazam 投票依据是什么？",
                "options": [
                    "哈希出现的总次数",
                    "相同 hash 在数据库时间与查询时间之间的时间偏移量",
                    "歌曲在数据库里的长度",
                    "查询音频的音量"
                ],
                "answer": 1,
                "explanation": "对每一对匹配的 hash，计算 offset = dbTime - queryTime，offset 一致的越多越可能是同一首歌。"
            },
            {
                "id": "c6q2",
                "type": "mcq",
                "question": "为什么时间偏移投票能判断是不是同一首歌？",
                "options": [
                    "因为所有歌长度相同",
                    "因为真实匹配的峰对应该共享一个固定时间差",
                    "因为投票总是随机产生",
                    "因为查询片段必须从头开始"
                ],
                "answer": 1,
                "explanation": "如果查询片段确实来自某首歌，所有匹配峰对的 dbTime-queryTime 应该接近同一个常数。"
            },
            {
                "id": "c6q3",
                "type": "tf",
                "question": "得票数最高的歌曲一定是正确答案。",
                "answer": false,
                "explanation": "得票最高只是最可能的候选，还需结合阈值、置信度等判断；偶然噪声也可能造成虚假高峰。"
            },
            {
                "id": "c6q4",
                "type": "mcq",
                "question": "查询片段可以从歌曲的任意位置开始，这会影响什么？",
                "options": [
                    "无法匹配",
                    "offset 会整体平移，但仍保持一致",
                    "需要重新训练模型",
                    "必须知道歌曲名才能匹配"
                ],
                "answer": 1,
                "explanation": "查询片段在歌曲中的起始位置不同，只是让 offset 整体平移，所有匹配峰对的 offset 仍然一致。"
            }
        ]
    },
    "chapter7": {
        "title": "第 7 章测验",
        "questions": [
            {
                "id": "c7q1",
                "type": "mcq",
                "question": "Shazam 识别的完整流程顺序是？",
                "options": [
                    "录音 → 建库 → 匹配 → 预处理",
                    "录音 → 预处理 → 生成指纹 → 检索匹配 → 返回结果",
                    "录音 → 返回结果 → 生成指纹",
                    "建库 → 录音 → 预处理 → 匹配"
                ],
                "answer": 1,
                "explanation": "流程是：录音 → 预处理（降采样、分帧、STFT）→ 提取峰值生成指纹 → 在数据库中检索匹配 → 返回最可能的歌曲。"
            },
            {
                "id": "c7q2",
                "type": "mcq",
                "question": "预处理阶段通常包括哪些操作？",
                "options": [
                    "只播放音频",
                    "降采样、分帧、加窗、傅里叶变换",
                    "直接把音频传给用户",
                    "删除所有低频成分"
                ],
                "answer": 1,
                "explanation": "预处理包括降采样减少计算、分帧、加窗（如 Hann）以及 STFT 得到时频图。"
            },
            {
                "id": "c7q3",
                "type": "tf",
                "question": "建库阶段和查询阶段使用的是同一套指纹提取流程。",
                "answer": true,
                "explanation": "为了保证一致性，数据库里的歌曲指纹和查询片段指纹必须用完全相同的算法提取。"
            }
        ]
    },
    "chapter8": {
        "title": "第 8 章测验",
        "questions": [
            {
                "id": "c8q1",
                "type": "mcq",
                "question": "以下哪项是 landmark 指纹的明显优势？",
                "options": [
                    "对旋律变化完全不变",
                    "计算轻量、对噪声和压缩鲁棒",
                    "能识别任意语言的语音",
                    "完全不需要索引"
                ],
                "answer": 1,
                "explanation": " landmark 方法计算简单、索引紧凑，对噪声、压缩、轻微失真都很鲁棒。"
            },
            {
                "id": "c8q2",
                "type": "mcq",
                "question": "如果一首歌被重新演唱（翻唱），Shazam 的 landmark 指纹通常会怎样？",
                "options": [
                    "完全不变",
                    "可能失效，因为旋律/音色变了",
                    "变得更鲁棒",
                    "自动识别出原唱"
                ],
                "answer": 1,
                "explanation": "翻唱会改变音高、音色、节奏，landmark 指纹主要匹配原始录音，对翻唱识别能力有限。"
            },
            {
                "id": "c8q3",
                "type": "tf",
                "question": "音频指纹技术与向量检索技术在「把相似性变成可计算问题」这一点上有相通之处。",
                "answer": true,
                "explanation": "两者都试图把复杂数据编码成可快速比较的结构：指纹用哈希投票，向量用距离度量。"
            },
            {
                "id": "c8q4",
                "type": "mcq",
                "question": "以下哪个不是 Shazam 典型应用场景？",
                "options": [
                    "听歌识曲",
                    "广告监测",
                    "天气预报",
                    "版权保护"
                ],
                "answer": 2,
                "explanation": "天气预报不属于音频指纹应用；听歌识曲、广告监测、版权保护都是典型场景。"
            }
        ]
    },
    "summary": {
        "title": "总测验",
        "questions": [
            {
                "id": "sq1",
                "type": "mcq",
                "question": "Shazam 音频指纹主要基于什么特征？",
                "options": [
                    "原始波形采样点",
                    "频谱能量峰值（landmark）",
                    "歌词文本",
                    "专辑封面"
                ],
                "answer": 1,
                "explanation": "Shazam 把音频转成时频图后，提取能量峰值作为稳定、鲁棒的地标特征。"
            },
            {
                "id": "sq2",
                "type": "mcq",
                "question": "组合哈希通常由哪三部分组成？",
                "options": [
                    "歌曲名、歌手、专辑",
                    "锚点频率、目标频率、时间差",
                    "采样率、位深、声道数",
                    "音量、节奏、时长"
                ],
                "answer": 1,
                "explanation": "Shazam 经典哈希格式是（anchorF, targetF, deltaT）。"
            },
            {
                "id": "sq3",
                "type": "mcq",
                "question": "Shazam 匹配时统计时间偏移直方图的核心目的是？",
                "options": [
                    "计算歌曲长度",
                    "判断查询片段在数据库歌曲中的对齐位置",
                    "给歌曲打分排序",
                    "去除噪声峰值"
                ],
                "answer": 1,
                "explanation": "真实匹配会呈现一个集中的时间偏移，直方图峰值对应的 offset 就是对齐位置。"
            },
            {
                "id": "sq4",
                "type": "tf",
                "question": "Landmark 指纹对翻唱和变速版本同样鲁棒。",
                "answer": false,
                "explanation": " landmark 方法对同一录音的噪声/压缩鲁棒，但对翻唱、变速、变调等版本识别能力较弱。"
            }
        ]
    }
};

const SZQuiz = {
    data: SZQuizData,
    state: {},

    init() {
        this.loadState();
        this.renderAll();
    },

    loadState() {
        try {
            const saved = localStorage.getItem('shazam_quiz_state');
            if (saved) {
                this.state = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load quiz state:', e);
            this.state = {};
        }
    },

    saveState() {
        try {
            localStorage.setItem('shazam_quiz_state', JSON.stringify(this.state));
        } catch (e) {
            console.warn('Failed to save quiz state:', e);
        }
    },

    renderAll() {
        document.querySelectorAll('.quiz-container').forEach(container => {
            const chapterId = container.dataset.chapter;
            if (chapterId && this.data[chapterId]) {
                this.render(container, chapterId);
            }
        });

        if (typeof window.updateCourseProgress === 'function') {
            window.updateCourseProgress();
        }
    },

    render(container, chapterId) {
        const chapter = this.data[chapterId];
        const state = this.state[chapterId] || { current: 0, answers: {}, completed: false };

        let html = `
            <div class="quiz-card" style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin: 32px 0; box-shadow: var(--shadow);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="margin: 0; color: var(--accent);">📝 ${chapter.title}</h4>
                    <span style="font-size: 0.85rem; color: var(--text-secondary);">${state.completed ? '已完成' : `第 ${state.current + 1} / ${chapter.questions.length} 题`}</span>
                </div>
        `;

        if (state.completed) {
            const correct = this.countCorrect(chapterId);
            html += this.renderResult(chapterId, correct, chapter.questions.length);
        } else {
            html += this.renderQuestion(chapterId, state.current);
        }

        html += '</div>';
        container.innerHTML = html;
    },

    renderQuestion(chapterId, questionIndex) {
        const chapter = this.data[chapterId];
        const question = chapter.questions[questionIndex];

        let html = `
            <div class="quiz-question" style="margin-bottom: 16px;">
                <p style="font-size: 1.05rem; font-weight: 600; margin-bottom: 16px;">${questionIndex + 1}. ${question.question}</p>
        `;

        if (question.type === 'mcq') {
            html += '<div style="display: flex; flex-direction: column; gap: 8px;">';
            question.options.forEach((option, idx) => {
                html += `
                    <label class="quiz-option" style="display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                        <input type="radio" name="q_${chapterId}_${questionIndex}" value="${idx}" style="cursor: pointer;">
                        <span>${option}</span>
                    </label>
                `;
            });
            html += '</div>';
        } else if (question.type === 'tf') {
            html += `
                <div style="display: flex; gap: 12px;">
                    <label class="quiz-option" style="flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="q_${chapterId}_${questionIndex}" value="true" style="cursor: pointer;">
                        <span>正确</span>
                    </label>
                    <label class="quiz-option" style="flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--bg-primary); border: 1px solid var(--border); border-radius: 8px; cursor: pointer;">
                        <input type="radio" name="q_${chapterId}_${questionIndex}" value="false" style="cursor: pointer;">
                        <span>错误</span>
                    </label>
                </div>
            `;
        }

        html += `
                <div class="quiz-feedback" style="display: none; margin-top: 16px; padding: 16px; border-radius: 8px;"></div>
            </div>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-primary" onclick="SZQuiz.checkAnswer('${chapterId}', ${questionIndex})">提交答案</button>
                ${questionIndex > 0 ? `<button class="btn btn-secondary" onclick="SZQuiz.prevQuestion('${chapterId}')">上一题</button>` : ''}
            </div>
        `;

        return html;
    },

    renderResult(chapterId, correct, total) {
        const percent = Math.round((correct / total) * 100);
        let message, color;

        if (percent === 100) {
            message = '太棒了！全部答对 🎉';
            color = 'var(--success)';
        } else if (percent >= 70) {
            message = '掌握得不错，继续加油！';
            color = 'var(--warning)';
        } else {
            message = '建议再复习一下本章内容。';
            color = 'var(--coral)';
        }

        return `
            <div style="text-align: center; padding: 20px 0;">
                <div style="font-size: 3rem; font-weight: 800; color: ${color}; margin-bottom: 8px;">${correct}/${total}</div>
                <p style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 16px;">${message}</p>
                <button class="btn btn-secondary" onclick="SZQuiz.restart('${chapterId}')">重新测验</button>
            </div>
        `;
    },

    checkAnswer(chapterId, questionIndex) {
        const chapter = this.data[chapterId];
        const question = chapter.questions[questionIndex];
        const state = this.state[chapterId] || { current: 0, answers: {}, completed: false };

        const inputs = document.querySelectorAll(`input[name="q_${chapterId}_${questionIndex}"]`);
        let selected = null;
        inputs.forEach(input => {
            if (input.checked) {
                selected = input.value;
            }
        });

        if (selected === null) {
            alert('请先选择一个答案');
            return;
        }

        let isCorrect = false;
        if (question.type === 'mcq') {
            isCorrect = parseInt(selected) === question.answer;
        } else if (question.type === 'tf') {
            isCorrect = (selected === 'true') === question.answer;
        }

        state.answers[questionIndex] = { selected, isCorrect };

        const feedback = document.querySelector(`#chapter${chapterId.replace('chapter', '')} .quiz-feedback, [data-chapter="${chapterId}"] .quiz-feedback`);
        if (feedback) {
            feedback.style.display = 'block';
            feedback.style.background = isCorrect ? 'var(--success)' : 'var(--coral)';
            feedback.style.color = '#fff';
            feedback.innerHTML = `
                <strong>${isCorrect ? '回答正确！' : '回答错误'}</strong><br>
                ${question.explanation}
            `;
        }

        inputs.forEach(input => input.disabled = true);

        this.state[chapterId] = state;
        this.saveState();

        setTimeout(() => {
            if (questionIndex < chapter.questions.length - 1) {
                state.current = questionIndex + 1;
                this.state[chapterId] = state;
                this.saveState();
                this.renderAll();
            } else {
                state.completed = true;
                this.state[chapterId] = state;
                this.saveState();
                this.renderAll();
            }
        }, 1800);
    },

    prevQuestion(chapterId) {
        const state = this.state[chapterId];
        if (state && state.current > 0) {
            state.current--;
            this.saveState();
            this.renderAll();
        }
    },

    restart(chapterId) {
        this.state[chapterId] = { current: 0, answers: {}, completed: false };
        this.saveState();
        this.renderAll();
    },

    countCorrect(chapterId) {
        const state = this.state[chapterId];
        if (!state || !state.answers) return 0;

        let correct = 0;
        Object.values(state.answers).forEach(ans => {
            if (ans.isCorrect) correct++;
        });
        return correct;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SZQuiz.init());
} else {
    SZQuiz.init();
}
