---
title: EvoFunc
tags: [C++, SFML, Neural Network, Genetic Algorithm, Visualization]
techStack: [C++, SFML, neural evolution]
featured: false
---

Visualizzatore interattivo C++/SFML di **reti neurali che evolvono per approssimare funzioni matematiche**.

Una popolazione di reti neurali piccole compete per replicare la funzione target; ogni generazione, le migliori vengono riprodotte con mutazione e crossover, mentre le peggiori vengono scartate.

## Cosa si vede

La finestra SFML mostra in tempo reale:
- La **funzione target** (curva di riferimento)
- Le **reti della popolazione corrente** (curve della generazione)
- Il **miglior individuo** evidenziato
- Statistiche di convergenza (fitness media, migliore, peggiore)

## Architettura

- `NeuralNetwork` - rete fully-connected con funzioni di attivazione configurabili (sigmoid, tanh, ReLU, linear)
- `EvolutionEngine` - tournament selection, crossover sui pesi, mutazione gaussiana
- `FunctionApproximator` - wrapper che valuta la fitness come differenza tra output della rete e valore reale della funzione target su N punti di campionamento
- Rendering SFML live - ogni generazione aggiorna il grafico senza bloccare l'evoluzione

## Stack

C++ · SFML · neural network da zero · algoritmo genetico custom
