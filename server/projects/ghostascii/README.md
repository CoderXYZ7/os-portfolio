---
title: GhostASCII
tags: [Python, Computer Vision, ASCII Art, Video, Segmentation]
techStack: [Python, OpenCV, segmentation model, numpy]
featured: true
---

Filtro video Linux che segmenta i soggetti in primo piano e li sostituisce con **ASCII art**, sovrapposta al video originale in tempo reale.

L'effetto: i soggetti "scompaiono" come fantasmi, rimpiazzati da caratteri ASCII che ne tracciano i contorni e le ombre - mentre lo sfondo rimane normale.

## Pipeline

1. **Estrazione frame** - OpenCV legge il video frame per frame
2. **Segmentazione** - modello di segmentation (MediaPipe Selfie o simile) isola il soggetto dallo sfondo
3. **Rendering ASCII** - la maschera del soggetto viene convertita in caratteri usando luminosità e un charset configurabile
4. **Overlay** - l'ASCII art viene composto sopra il frame originale con alpha-blending
5. **Output video** - ricompilazione in video con audio pass-through (OpenCV/ffmpeg)

## Configurazione

`config.yaml` permette di impostare charset, densità dei caratteri, colore dell'ASCII overlay, e sorgente del modello di segmentazione.

Supporta anche output **Braille** per un effetto alternativo ad alta densità.

```bash
python main.py --input video.mp4 --output ghosted.mp4
```

## Stack

Python · OpenCV · segmentation model · numpy · ffmpeg (audio pass-through)
