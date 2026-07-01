---
title: CamID
tags: [Python, Forensics, Computer Vision, PRNU, Clustering]
techStack: [Python, OpenCV, numpy, scikit-learn]
featured: false
---

Pipeline forense per attribuire fotografie alla fotocamera che le ha scattate, senza metadata EXIF.

Ogni sensore fotografico lascia un'**impronta digitale** unica (PRNU - Photo Response Non-Uniformity) in ogni immagine che produce, come un rumore di pattern fisso del sensore. CamID estrae queste impronte, le clusterizza e costruisce identità persistenti per ogni fotocamera.

## Pipeline

1. **Ingest** - scansione di una cartella di immagini
2. **Estrazione fingerprint** - calcolo del PRNU per ogni immagine tramite filtrazione del rumore
3. **Clustering** - raggruppamento automatico delle immagini per camera di origine
4. **Identità persistenti** - le identità camera vengono salvate nel database (`camid.db`)
5. **Query** - data una nuova immagine, il sistema ritorna la camera corrispondente o segnala "camera sconosciuta"

## Use case

Attribuzione in ambito forense digitale: stabilire se due set di foto provengono dallo stesso dispositivo, senza fare affidamento a metadata (che possono essere modificati o assenti).

## Stack

Python · OpenCV · numpy · scikit-learn · SQLite
