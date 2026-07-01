---
title: PIXNET
tags: [Python, Networking, Protocol Design, Graphics, Interactive]
techStack: [Python, asyncio, custom binary protocol, PIL/Pillow]
featured: true
---

Protocollo web grafico custom che trasmette pagine pixel-perfette con metadati interattivi. Invece di inviare markup e stili come HTTP/HTML, PIXNET trasmette **interfacce pixel complete** con zone comportamentali embedded - come shader interattivi.

## Il concetto

Web tradizionale: il server manda HTML/CSS → il browser lo renderizza.  
PIXNET: il server manda pixel + zone interattive → il client li mostra esattamente così.

Questo dà al server **controllo completo** sull'aspetto visivo, impossibile da approssimare con CSS, mentre le zone interattive (click region) definiscono comportamenti come navigazione, animazioni e audio.

## Formato PXNT

File binari compressi che codificano:
- Pixel dell'interfaccia (bitmap completo)
- **Zone interattive** con coordinate, tipo (click, hover) e azione
- Frame di **animazione** (transizioni, effetti)
- Stream audio embedded

## Casi d'uso

Game interface, installazioni interattive, HMI industriali, dashboard IoT, kiosk, strumenti di design dove il controllo pixel-perfetto è critico.

## Stack

Python · asyncio (server multi-client) · protocollo binario custom · PIL/Pillow · session management

```bash
pixnet-server --content examples/
pixnet-client --gui   # client GUI in altra finestra
```
