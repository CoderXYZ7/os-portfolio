---
title: RAG Chatbot
tags: [Python, AI, RAG, Ollama, LLM]
techStack: [Python, Ollama, RAG]
featured: true
---

Chatbot di assistenza clienti con sistema **Retrieval-Augmented Generation** sviluppato da zero in Python - prima che esistessero framework RAG plug-and-play.

Sviluppato in stage presso **Boato Pack** (2023/2024). Il sistema recupera documenti rilevanti dal knowledge base aziendale e li inietta nel contesto del modello linguistico prima della risposta, garantendo risposte ancorate ai dati reali.

**Caratteristiche:**
- RAG implementato from scratch in Python, senza framework esterni
- Integrazione con **Ollama** per esecuzione locale, sicura e criptata
- Nessun dato aziendale inviato a server esterni
- Pipeline di retrieval con embedding e similarity search

**Stack:** Python · Ollama · vector search · embedding locali
