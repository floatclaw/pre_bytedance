/**
 * ByteCover3 真实案例与面试题渲染
 */

const BCCasesData = {
    "cases": [
        {
            "id": "tiktok",
            "icon": "📱",
            "title": "TikTok / 抖音短视频版权监测",
            "scenario": "用户上传了一个 15 秒的短视频，背景音乐是某首流行歌的吉他翻唱版。平台需要识别原曲，以便进行版权管理和内容推荐。",
            "why": "ByteCover3 专门处理短查询匹配完整歌曲，且对翻唱、变调、变速度鲁棒，正好适合短视频场景。",
            "question": "思考：如果用户把原曲加速了 1.5 倍，ByteCover3 还能识别吗？为什么？"
        },
        {
            "id": "streaming",
            "icon": "🎵",
            "title": "音乐流媒体重复检测",
            "scenario": "唱片公司和用户都可能上传同一首歌的不同版本（录音室版、现场版、重新母带版），平台需要去重并统一推荐。",
            "why": "局部特征能抓住歌曲的核心旋律/和弦结构，而不是具体音色，所以不同制作版本也能匹配。",
            "question": "思考：如果一首歌有「原版」和「不插电版」，它们的 CQT 图会有什么相同和不同？"
        },
        {
            "id": "live",
            "icon": "🎤",
            "title": "直播 / KTV 背景音乐监测",
            "scenario": "主播在直播间播放或演唱了某首歌，平台需要实时监测并统计版权使用，用于后续结算。",
            "why": "直播音频通常有噪声、混响、人声伴奏混合，ByteCover3 的局部匹配方式比全局方法更能抵抗这些干扰。",
            "question": "思考：为什么直播场景比录播视频更难识别？"
        },
        {
            "id": "humming",
            "icon": "🎶",
            "title": "用户哼唱识别",
            "scenario": "用户对着手机哼唱了 10 秒某首歌，系统要从曲库里找到原曲。",
            "why": "哼唱只有旋律没有伴奏，但 CQT 能提取音高信息，MaxMean 能匹配局部旋律片段。",
            "question": "思考：哼唱识别和翻唱识别有什么共同点和不同点？"
        }
    ],
    "interview": [
        {
            "question": "为什么全局 embedding 对短查询会失效？",
            "answer": "全局 embedding 聚合了整首歌的信息。当查询只有十几秒时，完整歌曲的全局 embedding 会被大量无关片段稀释，导致查询和原曲的相似度被拉低。"
        },
        {
            "question": "MaxMean 为什么是非对称的？这样设计有什么好处？",
            "answer": "MaxMean 以较短的一方为基准，对短查询的每个 chunk 在候选长歌曲中找最匹配的部分再平均。这样不会惩罚长歌曲中的无关片段，更适合短查询匹配长歌曲的场景。"
        },
        {
            "question": "CQT 相比普通 STFT 频谱图有什么优势？",
            "answer": "CQT 的频率轴按对数分布，每八度固定 bin 数，每个 bin 对应一个半音，和音乐音阶对齐。同一旋律升调/降调时，CQT 图案只是整体平移，便于识别。"
        },
        {
            "question": "IBN 在翻唱识别中起什么作用？",
            "answer": "IBN 结合 Batch Normalization（保留内容信息）和 Instance Normalization（去除风格信息），让模型对歌手、乐器、调、速度等翻唱变化更鲁棒。"
        },
        {
            "question": "两阶段检索如何降低计算成本？",
            "answer": "第一阶段用 ANN（如 HNSW）快速筛选出少量候选 chunks；第二阶段只对这些候选歌曲计算精确的 MaxMean。避免了对数据库所有 chunks 做暴力比对。"
        },
        {
            "question": "Local Alignment Loss 中分类损失和 Triplet 损失分别起什么作用？",
            "answer": "分类损失让模型学会判断「这是哪首歌」；Triplet 损失让同一首歌的不同版本在特征空间中更近，不同歌更远。两者结合优化局部对齐。"
        },
        {
            "question": "如果一首歌被升调了 2 个 semitone，ByteCover3 还能识别吗？",
            "answer": "可以。升调只改变绝对音高，不改变旋律的相对音程。CQT 上的亮线会整体平移 2 个 bins，但模式保持一致，MaxMean 仍能匹配。"
        },
        {
            "question": "ByteCover3 的训练数据为什么要混合短片段和完整曲目？",
            "answer": "因为线上场景就是短查询匹配完整歌曲。训练时让模型见过这种情况，才能在实际应用中表现更好。"
        }
    ]
};

const BCCases = {
    data: BCCasesData,

    init() {
        this.renderCases();
        this.renderInterview();
    },

    renderCases() {
        const container = document.getElementById('cases-container');
        if (!container) return;

        let html = '';
        this.data.cases.forEach((caseItem, index) => {
            html += `
                <div class="case-card reveal">
                    <div class="case-header">
                        <div class="case-icon">${caseItem.icon}</div>
                        <div>
                            <div class="case-title">${caseItem.title}</div>
                        </div>
                    </div>
                    <h4>场景</h4>
                    <p>${caseItem.scenario}</p>
                    <h4>为什么 ByteCover3 适合？</h4>
                    <p>${caseItem.why}</p>
                    <div class="case-question">
                        <strong>思考题：</strong>${caseItem.question}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    renderInterview() {
        const container = document.getElementById('interview-container');
        if (!container) return;

        let html = '<div class="accordion-group">';
        this.data.interview.forEach((item, index) => {
            html += `
                <div class="accordion">
                    <button class="accordion-header">
                        <span>${index + 1}. ${item.question}</span>
                        <span class="accordion-icon">▼</span>
                    </button>
                    <div class="accordion-body">
                        <div class="accordion-content">
                            <p>${item.answer}</p>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;

        // Re-init accordions since we added new ones
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const body = header.nextElementSibling;
                const isOpen = body.classList.contains('open');

                // Close all in group
                const parent = header.closest('.accordion-group');
                if (parent) {
                    parent.querySelectorAll('.accordion-body').forEach(b => b.classList.remove('open'));
                    parent.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('active'));
                }

                if (!isOpen) {
                    body.classList.add('open');
                    header.classList.add('active');
                }
            });
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => BCCases.init());
} else {
    BCCases.init();
}
