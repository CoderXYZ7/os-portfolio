---
title: TrackIt
tags: [Python, PySide6, OpenCV, Computer Vision, Physics, AI]
techStack: [Python, PySide6, OpenCV, PyTorch, YOLOv8, scipy, pandas, matplotlib]
featured: true
---

Alternativa moderna al classico [Tracker Video Analysis Tool](https://physlets.org/tracker/) (OSP/Douglas Brown), costruita per la ricerca scientifica generale.

Permette di tracciare oggetti in video - manualmente o automaticamente - e ricavarne traiettorie 3D, velocità, accelerazione e bande di incertezza statistica, tutto dentro un'interfaccia Qt6 pulita.

## Funzionalità principali

- **Tracking manuale e automatico** - click-to-mark per frame, oppure OpenCV CSRT/KCF per tracking automatico; con YOLOv8 + SAM per detection deep learning (opzionale, GPU)
- **Calibrazione prospettica 3D constraint-based** - primitive grafiche (piano, box, linea) annotate sull'immagine; solver DLT + bundle adjustment (scipy) che ricava K, R, t della camera
- **Smoothing & prediction** - due modelli a scelta: filtro di Kalman con smoother RTS (gap fill + proiezione futura con covarianza crescente) oppure spline cubica con confidence interval bootstrap
- **Riproiezione 3D** - ogni coordinata 2D pixel viene riproiettata sull'intersezione raggio-piano con propagazione dell'incertezza via Jacobiano
- **Grafici live** - posizione, velocità, accelerazione con bande ±2σ, sincronizzati col frame corrente
- **Export** - CSV per track, Excel multi-foglio, figure matplotlib, salvataggio sessione in JSON (solo osservazioni, tutto il resto si ricalcola al caricamento)

## Stack

Python · PySide6 (Qt6) · OpenCV · ultralytics (YOLOv8) · segment-anything · filterpy · scipy · pandas · matplotlib · openpyxl
