/**
 * Shazam 音频指纹真实案例与面试题渲染
 */

const SZCasesData = {
    "cases": [
        {
            "id": "music-identification",
            "icon": "🎵",
            "title": "听歌识曲",
            "scenario": "用户在酒吧、商场或车里听到一段音乐，打开 App 录音 5-10 秒，系统返回歌曲名、歌手和专辑信息。",
            "why": "Shazam 把录音转成 landmark 指纹，与后台千万级曲库指纹比对。即使环境嘈杂、录音质量差，只要峰值结构保留就能识别。",
            "question": "思考：为什么哪怕只录了歌曲中间几秒，Shazam 也能识别，而不是必须从头开始？"
        },
        {
            "id": "ad-monitoring",
            "icon": "📺",
            "title": "广告监测",
            "scenario": "品牌方想在电视台、电台或网络直播里监测自己的广告有没有按时、按量播出。",
            "why": "把广告音频预先生成指纹，实时抓取广播流并提取指纹做连续匹配，就能知道广告出现的精确时间和次数。",
            "question": "思考：如果广告背景音乐被替换成其他歌曲，只靠音频指纹还能识别吗？"
        },
        {
            "id": "copyright",
            "icon": "©️",
            "title": "版权保护",
            "scenario": "短视频平台需要检测用户上传的视频是否使用了受版权保护的音乐。",
            "why": "版权曲库生成指纹后，用户视频音频流提取指纹进行匹配，可快速发现侵权片段，即使视频被剪辑、变速或加入背景噪音。",
            "question": "思考：用户把歌曲加速 2 倍或只截取副歌部分，传统音频指纹还能匹配吗？"
        },
        {
            "id": "broadcast-monitoring",
            "icon": "📻",
            "title": "广播电视内容监测",
            "scenario": "版权组织或数据公司需要统计某首歌曲在各地电台的播放量，用于版权结算。",
            "why": "通过连续音频指纹匹配，可以自动记录歌曲播放的时间、时长和频道，替代人工监听。",
            "question": "思考：连续监测场景下，如何设计「开始匹配」和「结束匹配」的判断逻辑？"
        }
    ],
    "interview": [
        {
            "question": "音频指纹和语音识别有什么区别？",
            "answer": "语音识别把音频转成文字，关注「说了什么」；音频指纹把音频转成紧凑特征，关注「这是哪段音频」，不需要理解语义内容。"
        },
        {
            "question": "Shazam 为什么要从时频图中提取峰值，而不是直接用原始波形？",
            "answer": "原始波形对噪声、音量、设备差异非常敏感；频谱峰值是稀疏、稳定的高层特征，对噪声、压缩、失真更鲁棒，且数据量小、检索快。"
        },
        {
            "question": "Landmark 指纹为什么对噪声鲁棒？",
            "answer": "噪声通常是随机分布的，不会系统性地改变能量最强的峰值位置；即使部分峰值丢失或新增少量伪峰，整体星座模式仍能匹配。"
        },
        {
            "question": "Shazam 的哈希通常由什么组成？",
            "answer": "经典格式是（锚点频率，目标频率，时间差）。一个锚点峰与附近时间窗口内的目标峰组合，生成一个哈希值。"
        },
        {
            "question": "倒排索引在 Shazam 中起什么作用？",
            "answer": "倒排索引把哈希值映射到（歌曲ID, 时间戳）列表。查询时，根据查询片段的哈希快速找到数据库中可能出现的位置，避免扫描全部歌曲。"
        },
        {
            "question": "时间偏移投票的原理是什么？",
            "answer": "如果查询片段确实来自某首歌，所有匹配哈希对的时间差 dbTime - queryTime 应该接近同一个常数。统计这个偏移的直方图，峰值对应的歌曲就是最可能的匹配。"
        },
        {
            "question": "Landmark 指纹有什么明显局限？",
            "answer": "对同一录音的噪声/压缩鲁棒，但对翻唱、变调、变速、乐器改编等版本识别能力有限；对极端噪声或强失真也可能失效。"
        },
        {
            "question": "如果让你设计一个短视频平台的音乐识别系统，你会怎么考虑？",
            "answer": "先明确识别对象（原曲/翻唱/片段），选择合适的指纹方案（landmark 或神经网络嵌入），建立倒排索引，考虑实时流处理、版权库更新、误报率控制和分布式扩展。"
        }
    ]
};

const SZCases = {
    data: SZCasesData,

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
                <div class="case-card">
                    <div class="case-header">
                        <div class="case-icon">${caseItem.icon}</div>
                        <div>
                            <div class="case-title">${caseItem.title}</div>
                        </div>
                    </div>
                    <h4>场景</h4>
                    <p>${caseItem.scenario}</p>
                    <h4>为什么适合用音频指纹？</h4>
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

        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const body = header.nextElementSibling;
                const isOpen = body.classList.contains('open');

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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SZCases.init());
} else {
    SZCases.init();
}
