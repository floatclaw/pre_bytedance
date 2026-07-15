import sys
import os
import numpy as np
import soundfile as sf
import torch
import torch.nn as nn
import torch.optim as optim

sys.path.insert(0, os.path.dirname(__file__))
from audio_utils import extract_cqt_features
from model import SimpleCQTNet, extract_embeddings
from retrieval import two_stage_retrieve


def generate_song(frequencies, duration=10.0, sr=22050, note_duration=0.5):
    """
    用一组频率生成一首"歌"：每个音符重复播放。

    参数:
        frequencies: list of float，音符频率
        duration: 总时长（秒）
        sr: 采样率
        note_duration: 每个音符持续时间
    """
    audio = np.array([])
    t_note = np.linspace(0, note_duration, int(sr * note_duration), endpoint=False)

    while len(audio) < int(sr * duration):
        for f in frequencies:
            note = 0.5 * np.sin(2 * np.pi * f * t_note)
            # 加泛音
            note += 0.25 * np.sin(2 * np.pi * 2 * f * t_note)
            note += 0.125 * np.sin(2 * np.pi * 3 * f * t_note)
            # 淡入淡出
            fade = int(0.05 * sr)
            note[:fade] *= np.linspace(0, 1, fade)
            note[-fade:] *= np.linspace(1, 0, fade)
            audio = np.concatenate([audio, note])
            if len(audio) >= int(sr * duration):
                break
        if len(audio) >= int(sr * duration):
            break

    audio = audio[:int(sr * duration)]
    return audio


def save_songs(output_dir='/tmp/bytecover3_demo_songs'):
    """生成并保存几首测试歌曲。"""
    os.makedirs(output_dir, exist_ok=True)

    songs = {
        'song1_do_mi_sol': [261.63, 329.63, 392.00, 523.25],   # C-E-G-C
        'song2_re_fa_la': [293.66, 349.23, 440.00, 587.33],    # D-F-A-D
        'song3_mi_sol_si': [329.63, 392.00, 493.88, 659.25],   # E-G-B-E
        'song4_fa_la_do': [349.23, 440.00, 523.25, 698.46],    # F-A-C-F
    }

    paths = {}
    for name, freqs in songs.items():
        audio = generate_song(freqs, duration=10.0)
        path = os.path.join(output_dir, f'{name}.wav')
        sf.write(path, audio, 22050)
        paths[name] = path

    return paths


def create_training_data(cqts_dict, n_triplets=200, embedding_dim=128):
    """
    为对比学习构造 triplet 训练数据。

    返回:
        anchors, positives, negatives: list of CQT chunks
    """
    song_names = list(cqts_dict.keys())

    anchors = []
    positives = []
    negatives = []

    for _ in range(n_triplets):
        # 随机选一首歌作为 anchor/positive
        pos_song = np.random.choice(song_names)
        # 随机选另一首歌作为 negative
        neg_song = np.random.choice([s for s in song_names if s != pos_song])

        # 从正例歌里随机选两个 chunks
        pos_chunks = cqts_dict[pos_song]
        neg_chunks = cqts_dict[neg_song]

        anchor_idx = np.random.randint(len(pos_chunks))
        positive_idx = np.random.randint(len(pos_chunks))
        negative_idx = np.random.randint(len(neg_chunks))

        anchors.append(pos_chunks[anchor_idx])
        positives.append(pos_chunks[positive_idx])
        negatives.append(neg_chunks[negative_idx])

    return anchors, positives, negatives


def train_model(model, anchors, positives, negatives, epochs=30, lr=0.001, device='cpu'):
    """用 triplet loss 训练 CNN。"""
    from model import cqt_to_tensor

    model.to(device)
    model.train()

    optimizer = optim.Adam(model.parameters(), lr=lr)
    criterion = nn.TripletMarginLoss(margin=0.3, p=2)

    n = len(anchors)

    for epoch in range(epochs):
        total_loss = 0.0

        # 小批量训练
        batch_size = 16
        indices = np.random.permutation(n)

        for i in range(0, n, batch_size):
            batch_idx = indices[i:i + batch_size]

            a_batch = torch.cat([cqt_to_tensor(anchors[j]).to(device) for j in batch_idx], dim=0)
            p_batch = torch.cat([cqt_to_tensor(positives[j]).to(device) for j in batch_idx], dim=0)
            n_batch = torch.cat([cqt_to_tensor(negatives[j]).to(device) for j in batch_idx], dim=0)

            anchor_emb = model(a_batch)
            positive_emb = model(p_batch)
            negative_emb = model(n_batch)

            loss = criterion(anchor_emb, positive_emb, negative_emb)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item()

        if (epoch + 1) % 10 == 0:
            print(f'Epoch [{epoch + 1}/{epochs}], Loss: {total_loss / (n // batch_size + 1):.4f}')

    return model


def main():
    print("=" * 60)
    print("ByteCover3 简化版 Demo")
    print("=" * 60)

    # 1. 生成测试歌曲
    print("\n[1/5] 生成测试歌曲...")
    song_paths = save_songs()
    for name, path in song_paths.items():
        print(f"  {name}: {path}")

    # 2. 提取 CQT chunks
    print("\n[2/5] 提取 CQT 特征...")
    chunk_duration = 2.0  # Demo 用短一点的 chunk
    hop_duration = 1.0

    cqts_dict = {}
    for name, path in song_paths.items():
        cqts, timestamps = extract_cqt_features(
            path,
            chunk_duration=chunk_duration,
            hop_duration=hop_duration,
            downsample_factor=10
        )
        cqts_dict[name] = cqts
        print(f"  {name}: {len(cqts)} chunks, shape {cqts[0].shape}")

    # 3. 训练模型
    print("\n[3/5] 用 triplet loss 训练简化 CNN...")
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f"  使用设备: {device}")

    model = SimpleCQTNet(n_bins=84, embedding_dim=64)

    anchors, positives, negatives = create_training_data(cqts_dict, n_triplets=300)
    model = train_model(model, anchors, positives, negatives, epochs=30, device=device)

    # 4. 提取所有歌曲的 embeddings
    print("\n[4/5] 提取 embeddings 并构建索引...")
    song_names = list(cqts_dict.keys())
    db_chunk_embs = []
    for name in song_names:
        embs = extract_embeddings(cqts_dict[name], model, device=device)
        db_chunk_embs.append(embs)
        print(f"  {name}: {embs.shape}")

    # 5. 生成查询片段并检索
    print("\n[5/5] 生成查询片段并做两阶段检索...")

    # 查询 1：song1 的短片段
    query_audio = generate_song([261.63, 329.63, 392.00, 523.25], duration=3.0)
    sf.write('/tmp/bytecover3_demo_songs/query_song1.wav', query_audio, 22050)
    query_cqts, _ = extract_cqt_features('/tmp/bytecover3_demo_songs/query_song1.wav',
                                          chunk_duration=chunk_duration,
                                          hop_duration=hop_duration,
                                          downsample_factor=10)
    query_embs = extract_embeddings(query_cqts, model, device=device)
    print(f"  查询片段来自 song1_do_mi_sol，有 {len(query_embs)} 个 chunks")

    results = two_stage_retrieve(query_embs, db_chunk_embs, song_names,
                                  top_k_candidates=4, ann_k=10)

    print("\n  检索结果：")
    for rank, (name, score) in enumerate(results, 1):
        marker = " <-- 正确答案" if name == 'song1_do_mi_sol' else ""
        print(f"    {rank}. {name}: {score:.4f}{marker}")

    # 查询 2：song3 的短片段
    print("\n  第二个查询：来自 song3_mi_sol_si 的片段")
    query_audio2 = generate_song([329.63, 392.00, 493.88, 659.25], duration=3.0)
    sf.write('/tmp/bytecover3_demo_songs/query_song3.wav', query_audio2, 22050)
    query_cqts2, _ = extract_cqt_features('/tmp/bytecover3_demo_songs/query_song3.wav',
                                           chunk_duration=chunk_duration,
                                           hop_duration=hop_duration,
                                           downsample_factor=10)
    query_embs2 = extract_embeddings(query_cqts2, model, device=device)

    results2 = two_stage_retrieve(query_embs2, db_chunk_embs, song_names,
                                   top_k_candidates=4, ann_k=10)

    print("\n  检索结果：")
    for rank, (name, score) in enumerate(results2, 1):
        marker = " <-- 正确答案" if name == 'song3_mi_sol_si' else ""
        print(f"    {rank}. {name}: {score:.4f}{marker}")

    print("\n" + "=" * 60)
    print("Demo 完成！")
    print("=" * 60)


if __name__ == '__main__':
    main()
