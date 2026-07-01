---
title: VectorSoup
tags: [Python, GPU, Genetic Algorithm, SVG, Computer Vision, AI]
techStack: [Python, PyTorch, CUDA, SVG]
featured: true
---

Algoritmo evolutivo GPU-accelerato che converte immagini raster in grafica vettoriale SVG tramite spline di Bézier con gradient fill.

## Come funziona

Ogni candidato della popolazione è una collezione di **N spline Bézier cubiche** con colori e gradient fill opzionali. La **fitness** è calcolata rasterizzando ogni candidato sulla GPU e confrontandolo con l'immagine target tramite MSE.

L'evoluzione usa **tournament selection**, **blend crossover** e **mutazione gaussiana** per convergere verso una rappresentazione vettoriale fedele all'originale.

Il risultato viene esportato come SVG con elementi `<path>` e definizioni di gradienti.

## Caratteristiche

- Rasterizzazione completamente su **GPU (CUDA)** - la fitness di tutta la popolazione viene calcolata in parallelo
- Support FP16 per ridurre il footprint in memoria
- **Speciation** opzionale - suddivide la popolazione in specie isolate per aumentare la diversità genetica
- Salvataggio progressivo degli SVG intermedi
- `--target-fitness` per terminare automaticamente quando si raggiunge la qualità desiderata
- Checkpointing per riprendere l'evoluzione da dove si era

```bash
python -m vectorsoup.main evolve input.png output.svg \
    --splines 50 --population 100 --generations 500 \
    --gradient-fills --device cuda
```

## Stack

Python · PyTorch · CUDA · SVG generation
