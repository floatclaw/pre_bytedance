import numpy as np
import librosa


def load_audio(path, sr=22050, mono=True):
    """加载音频文件并重采样到指定采样率。"""
    audio, _ = librosa.load(path, sr=sr, mono=mono)
    return audio


def split_chunks(audio, sr, chunk_duration=20.0, hop_duration=10.0):
    """
    把音频切成重叠的 chunks。

    参数:
        audio: 音频波形 (numpy array)
        sr: 采样率
        chunk_duration: 每个 chunk 的长度（秒）
        hop_duration: 相邻 chunk 的间隔（秒）

    返回:
        chunks: list of numpy arrays
        timestamps: list of (start_sec, end_sec)
    """
    chunk_samples = int(chunk_duration * sr)
    hop_samples = int(hop_duration * sr)

    chunks = []
    timestamps = []

    start = 0
    while start + chunk_samples <= len(audio):
        chunk = audio[start:start + chunk_samples]
        chunks.append(chunk)
        timestamps.append((start / sr, (start + chunk_samples) / sr))
        start += hop_samples

    # 如果最后一段不够长，也保留（用 0 填充）
    if start < len(audio):
        chunk = audio[start:]
        if len(chunk) < chunk_samples:
            chunk = np.pad(chunk, (0, chunk_samples - len(chunk)), mode='constant')
        chunks.append(chunk)
        timestamps.append((start / sr, len(audio) / sr))

    return chunks, timestamps


def compute_cqt(chunk, sr=22050, n_bins=84, bins_per_octave=12, hop_length=512):
    """
    计算单个 chunk 的 CQT。

    返回:
        cqt: 形状为 (n_bins, n_frames) 的复数矩阵
    """
    cqt = librosa.cqt(
        chunk,
        sr=sr,
        hop_length=hop_length,
        n_bins=n_bins,
        bins_per_octave=bins_per_octave
    )
    return cqt


def time_downsample(cqt, factor=100):
    """
    沿时间轴做下采样：把连续的 factor 帧平均成一帧。

    参数:
        cqt: (n_bins, n_frames)
        factor: 下采样倍数

    返回:
        (n_bins, n_frames_new)
    """
    n_bins, n_frames = cqt.shape
    n_new = n_frames // factor
    if n_new == 0:
        return cqt
    cqt = cqt[:, :n_new * factor]
    cqt = cqt.reshape(n_bins, n_new, factor)
    return np.mean(cqt, axis=2)


def amplitude_to_db(cqt, ref=None):
    """把 CQT 幅度转成 dB 刻度，便于可视化。"""
    return librosa.amplitude_to_db(np.abs(cqt), ref=ref)


def extract_cqt_features(path, sr=22050, chunk_duration=20.0, hop_duration=10.0,
                         n_bins=84, bins_per_octave=12, hop_length=512,
                         downsample_factor=100):
    """
    从音频文件中提取 CQT chunks。

    返回:
        cqts: list of (n_bins, n_frames) 的 CQT 矩阵
        timestamps: list of (start, end)
    """
    audio = load_audio(path, sr=sr)
    chunks, timestamps = split_chunks(audio, sr, chunk_duration, hop_duration)

    cqts = []
    for chunk in chunks:
        cqt = compute_cqt(chunk, sr, n_bins, bins_per_octave, hop_length)
        cqt = time_downsample(cqt, downsample_factor)
        cqts.append(cqt)

    return cqts, timestamps
