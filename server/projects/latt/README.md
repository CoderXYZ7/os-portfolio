---
title: LATT - Look At The Time
tags: [C++, Qt6, KDE, Linux, Kirigami]
techStack: [C++20, Qt6, KDE Frameworks 6, Kirigami, QML, CMake]
featured: true
---

App di gestione del tempo per Linux / KDE - orologi mondiali, timer, cronometro, focus Pomodoro, sveglie. Vive nel system tray e funziona anche a finestra chiusa.

**No account. No rete. No telemetry.** Tutto è locale, persistito con KConfig.

## Funzionalità

- **World clocks** - qualsiasi IANA timezone con offset UTC, hint "Tomorrow/Yesterday" e city picker cercabile
- **Meeting planner** - overlay degli orologi su una strip oraria, trascina l'ora di riferimento per vedere le sovrapposizioni di orario lavorativo
- **Timer multipli** con barra di progresso, preset quick-start (Tea, Coffee…), notifica KDE nativa + audio alla scadenza con azioni Stop e Postpone
- **Focus Pomodoro** - cicli focus/pausa breve/pausa lunga configurabili, anello di progresso, pip per le sessioni
- **Cronometro** con lap/split, riprende il conteggio dopo riavvio dell'app
- **Sveglie** one-shot o ricorrenti settimanali (per singolo giorno della settimana), notifica persistent con urgenza critica, suono in loop, Snooze e Dismiss - anche con finestra chiusa
- **Suonerie personalizzabili** per ogni timer e sveglia (tono built-in, Silenzioso, file audio custom con anteprima)
- **Esegui un comando** quando scatta timer o sveglia (qualsiasi script shell)
- **Shortcut globali** (KGlobalAccel) - funzionano anche quando LATT è nel tray
- **Single instance** - riaprire LATT porta in primo piano la finestra esistente (KDBusService)

## Stack

C++20 · Qt6 Quick/Multimedia/DBus · KDE Frameworks 6 (Kirigami, KConfig, KNotifications, KStatusNotifierItem) · CMake + ECM
