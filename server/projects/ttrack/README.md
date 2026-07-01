---
title: TTrack
tags: [Flutter, Dart, Android, SQLite, Privacy]
techStack: [Flutter, Riverpod, Drift, SQLCipher, go_router]
featured: true
---

Task manager offline-first per Android, costruito in Flutter. Nessun account, nessun backend, nessun telemetry - tutto rimane sul dispositivo. Con vault opzionale che cifra il database con SQLCipher.

## Principi

- **Local-first** - funziona completamente offline, i dati non escono mai dal device
- **Privacy by default** - nessun cloud, nessun sign-in, nessun tracciamento
- **Fast and focused** - fa tasks, e le fa bene

## Funzionalità

- Task con titolo, note, **priorità** (nessuna / bassa / media / alta), **stato** (to-do / in progress / done / cancelled), data e ora di scadenza
- **Subtask** con progress bar automatica sul task padre
- **Tag** cross-lista, gestiti in un pannello dedicato
- **Liste** e **cartelle** con colori e icone personalizzate; Inbox per i task non assegnati
- Sort rapido (Newest → Priority → Due date) con un tap, sheet completo con long-press
- **Ordinamento manuale** drag-and-drop
- **Widget home-screen Android**: lista task pendenti, Quick Add, riepilogo giornaliero
- **Vault cifrato**: la chiave viene derivata dal PIN con Argon2id e tenuta solo in memoria, mai scritta su disco

## Stack

Flutter · Riverpod · go_router · Drift (SQLite ORM) · SQLCipher · flutter_secure_storage · home_widget · workmanager
