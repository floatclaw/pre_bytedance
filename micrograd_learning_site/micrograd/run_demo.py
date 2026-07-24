# Simple runnable demo for micrograd
# Generates a 2D moon dataset and trains a tiny MLP binary classifier.

import random
import math
from micrograd.engine import Value
from micrograd.nn import MLP

random.seed(42)

def generate_moons(n=100, noise=0.1):
    points = []
    n_per = n // 2
    for i in range(n_per):
        t = (i / n_per) * math.pi
        points.append((math.cos(t) + random.uniform(-noise, noise),
                       math.sin(t) + random.uniform(-noise, noise), 0))
    for i in range(n_per):
        t = (i / n_per) * math.pi
        points.append((1 - math.cos(t) + random.uniform(-noise, noise),
                       1 - math.sin(t) - 0.5 + random.uniform(-noise, noise), 1))
    return points

# Model
model = MLP(2, [8, 1])

# Dataset
data = generate_moons(80, 0.15)

# Training loop
learning_rate = 0.1
for step in range(50):
    total_loss = Value(0.0)
    n = 0
    for x, y, label in data:
        pred = model([Value(x), Value(y)])
        yval = Value(label * 2 - 1)  # -1 or +1
        loss = (yval - pred) ** 2
        total_loss = total_loss + loss
        n += 1

    avg_loss = total_loss * (1.0 / n)

    # zero grad
    for p in model.parameters():
        p.grad = 0.0

    avg_loss.backward()

    # update
    for p in model.parameters():
        p.data -= learning_rate * p.grad

    if step % 10 == 0:
        print(f"step {step:3d} | loss = {avg_loss.data:.4f}")

# Compute accuracy
correct = 0
for x, y, label in data:
    pred = model([Value(x), Value(y)]).data
    pred_label = 1 if pred > 0 else 0
    if pred_label == label:
        correct += 1

print(f"\naccuracy = {correct}/{len(data)} = {correct/len(data):.2%}")
print("micrograd demo ran successfully")
