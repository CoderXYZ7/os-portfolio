---
title: EvoImg
tags: [Python, GPU, Genetic Algorithm, Noise, PyTorch, AI]
techStack: [Python, PyTorch, CUDA, numpy]
featured: true
---

Algoritmo genetico GPU-accelerato che approssima immagini target sovrapponendo **layer di rumore procedurale** colorato e trasparente, evolvendoli finché la composizione non converge verso l'originale.

Progetto gemello di VectorSoup ma con un genome radicalmente diverso: invece di spline vettoriali, lavora con layer noise parametrici (seed, scala, offset, colore, alpha).

## Genome

Ogni candidato è una lista di `NoiseLayer`:
- `seed` - seme del rumore procedurale
- `scale` - frequenza spaziale del pattern
- `offset_x / offset_y` - traslazione del pattern
- `color` - RGB float (tensor GPU)
- `alpha` - opacità del layer

La composizione dei layer viene rasterizzata su GPU e confrontata con il target tramite MSE per calcolare la fitness.

## Caratteristiche

- **FP16 opzionale** per dimezzare la memoria GPU
- **Adaptive mutation** - aumenta il tasso di mutazione quando il miglioramento si blocca
- **Speciation** - isola la popolazione in specie per mantenere diversità genetica
- **Fitness downsampling** - calcola la fitness su immagini ridimensionate per velocizzare le generazioni iniziali
- **Checkpoint automatico** - salva il miglior genome mai trovato; riprende se non c'è miglioramento per N generazioni
- Output intermedi per visualizzare la convergenza

## Stack

Python · PyTorch · CUDA · numpy
