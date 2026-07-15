import numpy as np
from sklearn.neighbors import NearestNeighbors


def cosine_similarity(a, b):
    """
    计算两个向量或两组向量之间的余弦相似度。

    参数:
        a: (D,) 或 (M, D)
        b: (D,) 或 (N, D)

    返回:
        如果 a,b 都是 (D,): 标量
        如果 a 是 (M,D), b 是 (N,D): (M, N) 矩阵
    """
    a = np.atleast_2d(a)
    b = np.atleast_2d(b)
    # 假设输入已经 L2 归一化
    return np.dot(a, b.T)


def maxmean_similarity(query_embs, candidate_embs):
    """
    计算 MaxMean 相似度。

    参数:
        query_embs: (M, D) 查询音频的局部 embeddings
        candidate_embs: (N, D) 候选歌曲的局部 embeddings

    返回:
        score: 标量，MaxMean 相似度
    """
    # 计算所有 query chunk 和所有 candidate chunk 的余弦相似度
    sim_matrix = cosine_similarity(query_embs, candidate_embs)  # (M, N)

    # 对每个 query chunk，找 candidate 里最像的 chunk
    max_sim_per_query = np.max(sim_matrix, axis=1)  # (M,)

    # 取平均
    score = np.mean(max_sim_per_query)
    return float(score)


def build_chunk_index(database_chunk_embs, algorithm='auto', n_neighbors=10):
    """
    为数据库中所有 chunk 的 embedding 建立 ANN 索引。

    参数:
        database_chunk_embs: list of (N_i, D) numpy arrays，每首歌的 chunks
        algorithm: sklearn NearestNeighbors 的 algorithm 参数
        n_neighbors: 每次查询返回的最近邻数量

    返回:
        nn_model: 训练好的 NearestNeighbors 模型
        chunk_to_song: list，每个 chunk 对应的歌的索引
        all_chunks: (total_chunks, D) 所有 chunk 堆叠成的矩阵
    """
    all_chunks = []
    chunk_to_song = []

    for song_idx, chunks in enumerate(database_chunk_embs):
        for chunk in chunks:
            all_chunks.append(chunk)
            chunk_to_song.append(song_idx)

    all_chunks = np.array(all_chunks)

    nn_model = NearestNeighbors(n_neighbors=min(n_neighbors, len(all_chunks)),
                                algorithm=algorithm,
                                metric='cosine')
    nn_model.fit(all_chunks)

    return nn_model, chunk_to_song, all_chunks


def two_stage_retrieve(query_embs, database_chunk_embs, database_song_names,
                       nn_model=None, top_k_candidates=10, ann_k=50):
    """
    两阶段检索。

    参数:
        query_embs: (M, D) 查询音频的局部 embeddings
        database_chunk_embs: list of (N_i, D) numpy arrays
        database_song_names: list of str
        nn_model: 预训练好的 NearestNeighbors 模型（可选）
        top_k_candidates: 第二阶段返回的候选歌曲数量
        ann_k: 第一阶段每个 query chunk 返回的最近邻数量

    返回:
        results: list of (song_name, score) tuples，按 score 排序
    """
    # 第一阶段：如果没有提供索引，先建立索引
    if nn_model is None:
        nn_model, chunk_to_song, all_chunks = build_chunk_index(database_chunk_embs,
                                                                 n_neighbors=ann_k)
    else:
        # 这里需要 chunk_to_song，但 nn_model 已经 fit 好了，需要重新 fit 或传入
        # 简化处理：重新构建索引
        nn_model, chunk_to_song, all_chunks = build_chunk_index(database_chunk_embs,
                                                                 n_neighbors=ann_k)

    # 对每个 query chunk 找 Top-K 最近邻
    distances, indices = nn_model.kneighbors(query_embs)
    # sklearn 用 cosine metric 返回的是距离，不是相似度
    # cosine 距离 = 1 - cosine 相似度

    # 收集候选歌曲
    candidate_song_indices = set()
    for idx_list in indices:
        for idx in idx_list:
            candidate_song_indices.add(chunk_to_song[idx])

    # 第二阶段：对候选歌曲计算 MaxMean 相似度
    results = []
    for song_idx in candidate_song_indices:
        candidate_embs = database_chunk_embs[song_idx]
        score = maxmean_similarity(query_embs, candidate_embs)
        results.append((database_song_names[song_idx], score))

    # 按分数降序排序
    results.sort(key=lambda x: x[1], reverse=True)

    return results[:top_k_candidates]
