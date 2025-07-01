export interface Appointment {
  id: number;
  descrizione: string;
  date: Date;
  confermato?: boolean;
  annullato?: boolean;
  selected?: boolean;
}

export interface Day {
  giorno: number;
  appuntamenti: Appointment[];
}

export interface Month {
  mese: string;
  giorni: Day[];
}
