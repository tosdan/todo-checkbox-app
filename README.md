# Specifiche applicazione

Applicazione da sviluppare in Angular e tailwind-css per gli stili. Deve avere uno stile moderno ed elegante e deve essere implementata usando i signal e non è previsto un backend quindi deve essere tutto salvato in localstorage del browser.
L'ambiente di sviluppo è windows, in particulare la console è powershell.

La home dell'app mostra una lista di giorni, raggruppati per mese. Ogni giorno contiene uno o più appuntamenti, ma a livello grafico viene mostrato l'elemento giorno con indicazione di quanti appuntamenti ci sono in quel giorno, quanti appuntamenti sono annullati, quanti sono da confermare e quanti sono confermati. Inoltre ogni elemento giorno ha una checkbox per poter selezionare il giorno e confermare oppure annullare tutti gli appuntamenti di quel giorno. Inoltre anche nell'intestazione del blocco mese c'è una checkbox che contenste di selezionare tutti i giorni di quel mese per poter fare le stesse operazioni massive su tutti i giorni selezionati.
L'applicazione deve poter consentire di inserire un nuovo appuntamento specificando il giorno, la descrizione e la data.
Prevedere anche un pulsante che cancella tutti i dati dal localstorage.

Ecco un esempio di come puotrebbe essere il model dell'app:
```ts
  const mainList = [
    [{
      mese: "Gennaio",
      giorni: [{
        giorno: 2,
        appuntamenti: [{
          id: 1,
          descrizione: "Concerto al palazzetto",
          date: new Date(2025, 0, 2, 20, 0, 0),
          confermato: true,
        }],
      }, {
        giorno: 12,
        appuntamenti: [{
          id: 2,
          descrizione: "Dentista",
          date: new Date(2025, 0, 12, 12, 0, 0),
          confermato: true,
        }, {
          id: 3,
          descrizione: "Cena fuori con amici",
          date: new Date(2025, 0, 12, 20, 0, 0),
          confermato: true,
        }]
      }]
    }, {
      mese: "Febbraio",
      giorni: [{
        giorno: 6,
        appuntamenti: [{
          id: 4,
          descrizione: "Degustazione vini",
          date: new Date(2025, 1, 6, 20, 0, 0),
          annullato: true,
        }],
      }, {
        giorno: 25,
        appuntamenti: [{
          id: 5,
          descrizione: "Biciclettata",
          date: new Date(2025, 1, 25, 12, 0, 0),
        }, {
          id: 6,
          descrizione: "Cena fuori con amici",
          date: new Date(2025, 1, 25, 20, 0, 0),
        }]
      }]
    }, {
      mese: "Marzo",
      giorni: [{
        giorno: 9,
        appuntamenti: [{
          id: 7,
          descrizione: "Gita a Firenze",
          date: new Date(2025, 2, 9, 20, 0, 0),
        }],
      }, {
        giorno: 17,
        appuntamenti: [{
          id: 8,
          descrizione: "Manutenzione auto",
          date: new Date(2025, 2, 17, 12, 0, 0),
        }, {
          id: 9,
          descrizione: "Cena con colleghi",
          date: new Date(2025, 12, 17, 20, 0, 0),
        }]
      }]
    }]
  ]
```
