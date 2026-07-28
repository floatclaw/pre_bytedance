import numpy as np
import torch
import torch.nn as nn


class SimpleCQTNet(nn.Module):
    """
    简化的 CQT 特征提取网络。

    把一张 CQT 图（1 x n_bins x n_frames）映射成一个固定维度的 embedding。
    """

    def __init__(self, n_bins=84, embedding_dim=128):
        super(SimpleCQTNet, self).__init__()

        self.conv = nn.Sequential(
            # 输入: (B, 1, n_bins, n_frames)
            nn.Conv2d(1, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),  # -> (B, 32, n_bins/2, n_frames/2)

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),  # -> (B, 64, n_bins/4, n_frames/4)

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            # 使用 AdaptiveAvgPool 把空间维度压缩到 1x1
            nn.AdaptiveAvgPool2d((1, 1))  # -> (B, 128, 1, 1)
        )

        self.fc = nn.Linear(128, embedding_dim)

    def forward(self, x):
        """
        参数:
            x: (B, 1, n_bins, n_frames)
        返回:
            (B, embedding_dim)
        """
        x = self.conv(x)
        x = x.view(x.size(0), -1)  # (B, 128)
        x = self.fc(x)  # (B, embedding_dim)
        # L2 归一化，让 embedding 落在单位球面上，便于用余弦相似度
        x = nn.functional.normalize(x, p=2, dim=1)
        return x


def cqt_to_tensor(cqt):
    """
    把 numpy CQT（可以是复数或幅度）转成 PyTorch 张量。

    返回:
        tensor: (1, 1, n_bins, n_frames)
    """
    if np.iscomplexobj(cqt):
        cqt = np.abs(cqt)
    # 取对数幅度，数值更稳定
    cqt = np.log1p(cqt)
    tensor = torch.from_numpy(cqt).float().unsqueeze(0).unsqueeze(0)
    return tensor


def extract_embeddings(cqts, model, device='cpu'):
    """
    从一组 CQT chunks 中提取 embedding。

    参数:
        cqts: list of (n_bins, n_frames)
        model: SimpleCQTNet

    返回:
        embeddings: (N, embedding_dim) numpy array
    """
    model.eval()
    embeddings = []
    with torch.no_grad():
        for cqt in cqts:
            x = cqt_to_tensor(cqt).to(device)
            emb = model(x)
            embeddings.append(emb.cpu().numpy()[0])
    return np.array(embeddings)
