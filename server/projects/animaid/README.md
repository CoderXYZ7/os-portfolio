---
title: AnimaID
tags: [PHP, Web, Management, Docker, JWT, REST API]
techStack: [PHP 8.1, MySQL, JWT, Docker, PHPUnit, Composer]
featured: true
---

Piattaforma web completa per la gestione di centri estivi e organizzazioni giovanili. Connette staff, attività e famiglie in un unico ambiente digitale.

## Funzionalità principali

- **Multi-ruolo** - Admin, Coordinatore, Animatore, Genitore; permessi granulari per ogni azione; autenticazione JWT con blacklist delle sessioni
- **Gestione bambini** - registrazione completa con info mediche, contatti d'emergenza, relazioni genitori/tutori, storico attività
- **Gestione animatori** - profili, disponibilità settimanale per tipo-settimana, eccezioni e ferie, collegamento account utente
- **Calendario ed eventi** - eventi multi-giorno con location, capienza, limiti d'età, visibilità pubblica/privata, registrazione partecipanti
- **Presenze** - check-in/check-out rapido, tracciamento real-time, report filtrati per data e evento
- **Comunicazioni** - bacheca annunci interni e comunicazioni per genitori, sistema commenti, allegati, lettura/non-lettura tracciata, priorità e categorie
- **Wiki interna** - knowledge base con Markdown, categorie e tag

## Architettura

API REST PHP con autenticazione JWT, deployed via Docker Compose (app + database). Struttura MVC con routing interno, repository layer, e suite di test PHPUnit.

## Stack

PHP 8.1 · MySQL · JWT · Docker / Docker Compose · PHPUnit · Composer
