---
title: Ripple
tags: [Python, Language Design, Compiler, DSL, Event-Driven]
techStack: [Python, Lark (parser), custom type checker, custom runtime]
featured: true
---

Linguaggio di scripting event-driven progettato per pipeline di elaborazione dati. I dati scorrono come **"pulse"** (eventi tipizzati) attraverso **sezioni** che possono splittare, trasformare, fare join e prendere decisioni.

## Il modello

Un programma Ripple definisce un tipo `pulse` con attributi fortemente tipizzati, poi descrive sezioni che lo trasformano:

```ripple
pulse Order {
    customer: String
    item: String
    quantity: Int
    unit_price: Int
}

section receive {
    [add pulse.subtotal: Int]
    [pulse.subtotal = pulse.quantity * pulse.unit_price]
    [route to: discount_engine]
    [route to: tax_engine]      // fork parallelo
}

section discount_engine {
    [ifelse pulse.quantity > 10 {
        [pulse.discount = pulse.subtotal / 5]
    } {
        [pulse.discount = 0]
    }]
    [route to: checkout]
}
```

Il `[route to: X]` in due sezioni diverse genera un fork parallelo; un join gate sincronizza i branch prima di proseguire.

## Funzionalità

- **Type checker statico** - ogni attributo del pulse è verificato prima dell'esecuzione; errori di tipo con riga e contesto
- **Fork / join** - split a più branch paralleli con merge sincrono su attributi
- **Scheduler runtime** - esecuzione delle sezioni in ordine topologico
- **Visualizzatore** - server async che genera un grafico interattivo del flusso del pulse attraverso le sezioni
- **Progetti** - cartella con `project.json` che aggrega più script

## Stack

Python · Lark (grammar PEG) · type checker custom · scheduler custom · asyncio (visualizer server)
