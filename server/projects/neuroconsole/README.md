---
title: NeuroConsole
tags: [Python, AI, Voice, NLP, Modular Architecture]
techStack: [Python, asyncio, LLM integration]
featured: false
---

Console modulare Python per elaborare un flusso continuo di testo trascritto (da speech-to-text). Rileva frasi di attivazione, instrada i comandi ai moduli appropriati e orchestra le risposte.

## Architettura

Il sistema è costruito attorno a un principio **plug-and-play**: ogni componente espone un'interfaccia standard e può essere sostituito indipendentemente.

```
[stream STT] → InputStreamHandler → CommandRouter → [moduli specializzati]
                                          ↓
                                   AI Processing Module
                                   (reasoning layer)
```

- **InputStreamHandler** - normalizza il testo in arrivo, rileva le frasi di attivazione ("hey neuroconsole"), emette eventi `activation_detected`
- **CommandRouter** - determina l'intent, gestisce lo stato multi-turno, dispatcha al modulo corretto
- **AI Processing Module** - forwarda query NL al modello linguistico con contesto e metadati, separa output vocale da invocazioni di comandi
- **Moduli specializzati** - tempo, calendario, meteo, e altri; ognuno documentato per l'integrazione con AI API

## Utilizzo

```bash
neuroconsole run
# Interactive mode:
# 🎤 hey neuroconsole what time is it
# 🎯 Activation detected: what time is it
# 🎤 3:42 PM
```

## Stack

Python · asyncio · LLM API integration · sistema di moduli plug-and-play
