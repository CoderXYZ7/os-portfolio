---
title: LLM Security Test
tags: [PHP, Security, Phishing Simulation, Awareness Training]
techStack: [PHP, SQLite, HTML/CSS]
featured: false
---

Tool PHP per **simulazioni di phishing interne** - progettato esclusivamente per test di sicurezza autorizzati e programmi di awareness aziendale.

## Cosa fa

Simula campagne di phishing realistiche per misurare la vulnerabilità degli utenti a diversi vettori di attacco, poi mostra immediatamente una pagina formativa a chi ci "cade".

**Non è uno strumento offensivo** - è pensato per il team di sicurezza interno per allenare i dipendenti a riconoscere le minacce.

## Template inclusi

5 campagne preconfigurate con livelli di difficoltà diversi:
- Password reset IT (facile)
- HR annual enrollment benefits (medio)
- CEO fraud / gift card scam (difficile)
- SharePoint document sharing (medio)
- Delivery notification (facile)

## Funzionalità

- Tracciamento click e inserimento credenziali per campagna e utente (token univoco per dipendente)
- Dashboard admin con statistiche per campagna, export CSV
- Pagina di awareness immediata dopo la cattura
- IP, user agent e timestamp loggati per analisi
- Configurazione server Apache/Nginx con restrizione IP sull'admin panel

## Stack

PHP · SQLite · HTML/CSS · shell script per avvio server locale
