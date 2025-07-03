import { Injectable, computed, effect } from '@angular/core';
import { signalState, patchState } from '@ngrx/signals';
import { Appointment, Month } from '../models/appointment.model';

export interface AppointmentsState {
  list: Month[];
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private readonly state = signalState<AppointmentsState>({ list: [] });
  public readonly mainList = computed(() => this.state().list);
  private readonly localStorageKey = 'todo-app-data';

  constructor() {
    this.loadAppointments();
    effect(() => {
      this.saveAppointments();
    });
  }

  private loadAppointments(): void {
    const data = localStorage.getItem(this.localStorageKey);
    if (data) {
      const parsedData: Month[] = JSON.parse(data);
      parsedData.forEach(month => {
        month.giorni.forEach(day => {
          day.appuntamenti.forEach(appointment => {
            appointment.date = new Date(appointment.date);
            appointment.selected = false;
          });
        });
      });
      patchState(this.state, { list: parsedData });
    } else {
      patchState(this.state, { list: this.getInitialData() });
    }
  }

  private saveAppointments(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.state().list));
  }

  addAppointment(newAppointment: Appointment): void {
    const date = new Date(newAppointment.date);
    const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
    const monthName = monthNames[date.getMonth()];
    const dayNumber = date.getDate();

    const currentList = this.state().list;
    let monthIndex = currentList.findIndex(m => m.mese === monthName);

    if (monthIndex === -1) {
      const newList = [...currentList, { mese: monthName, giorni: [] }];
      newList.sort((a, b) => monthNames.indexOf(a.mese) - monthNames.indexOf(b.mese));
      patchState(this.state, { list: newList });
      monthIndex = this.state().list.findIndex(m => m.mese === monthName);
    }

    const month = this.state().list[monthIndex];
    let dayIndex = month.giorni.findIndex(d => d.giorno === dayNumber);

    if (dayIndex === -1) {
      const newGiorni = [...month.giorni, { giorno: dayNumber, appuntamenti: [] }];
      newGiorni.sort((a, b) => a.giorno - b.giorno);
      const newList = [...this.state().list];
      newList[monthIndex] = { ...month, giorni: newGiorni };
      patchState(this.state, { list: newList });
      dayIndex = newGiorni.findIndex(d => d.giorno === dayNumber);
    }

    const day = this.state().list[monthIndex].giorni[dayIndex];
    const newAppuntamenti = [...day.appuntamenti, { ...newAppointment, selected: false }];
    newAppuntamenti.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const newList = [...this.state().list];
    newList[monthIndex].giorni[dayIndex] = { ...day, appuntamenti: newAppuntamenti };
    patchState(this.state, { list: newList });
  }

  clearAllData(): void {
    localStorage.removeItem(this.localStorageKey);
    patchState(this.state, { list: [] });
  }

  updateAppointmentSelection(monthName: string, dayNumber: number, appointmentId: number, selected: boolean): void {
    const newList = this.state().list.map(month => {
      if (month.mese === monthName) {
        const newGiorni = month.giorni.map(day => {
          if (day.giorno === dayNumber) {
            const newAppuntamenti = day.appuntamenti.map(app => {
              if (app.id === appointmentId) {
                return { ...app, selected };
              }
              return app;
            });
            return { ...day, appuntamenti: newAppuntamenti };
          }
          return day;
        });
        return { ...month, giorni: newGiorni };
      }
      return month;
    });
    patchState(this.state, { list: newList });
  }

  updateDaySelection(monthName: string, dayNumber: number, selected: boolean): void {
    const newList = this.state().list.map(month => {
      if (month.mese === monthName) {
        const newGiorni = month.giorni.map(day => {
          if (day.giorno === dayNumber) {
            const newAppuntamenti = day.appuntamenti.map(app => ({ ...app, selected }));
            return { ...day, appuntamenti: newAppuntamenti };
          }
          return day;
        });
        return { ...month, giorni: newGiorni };
      }
      return month;
    });
    patchState(this.state, { list: newList });
  }

  updateMonthSelection(monthName: string, selected: boolean): void {
    const newList = this.state().list.map(month => {
      if (month.mese === monthName) {
        const newGiorni = month.giorni.map(day => {
          const newAppuntamenti = day.appuntamenti.map(app => ({ ...app, selected }));
          return { ...day, appuntamenti: newAppuntamenti };
        });
        return { ...month, giorni: newGiorni };
      }
      return month;
    });
    patchState(this.state, { list: newList });
  }

  confirmSelectedAppointments(): void {
    const newList = this.state().list.map(month => ({
      ...month,
      giorni: month.giorni.map(day => ({
        ...day,
        appuntamenti: day.appuntamenti.map(app => {
          if (app.selected) {
            return { ...app, confermato: true, annullato: false, selected: false };
          }
          return app;
        })
      }))
    }));
    patchState(this.state, { list: newList });
  }

  cancelSelectedAppointments(): void {
    const newList = this.state().list.map(month => ({
      ...month,
      giorni: month.giorni.map(day => ({
        ...day,
        appuntamenti: day.appuntamenti.map(app => {
          if (app.selected) {
            return { ...app, annullato: true, confermato: false, selected: false };
          }
          return app;
        })
      }))
    }));
    patchState(this.state, { list: newList });
  }

  unconfirmSelectedAppointments(): void {
    const newList = this.state().list.map(month => ({
      ...month,
      giorni: month.giorni.map(day => ({
        ...day,
        appuntamenti: day.appuntamenti.map(app => {
          if (app.selected) {
            return { ...app, confermato: false, annullato: false, selected: false };
          }
          return app;
        })
      }))
    }));
    patchState(this.state, { list: newList });
  }

  selectedAppointmentsCount = computed(() => {
    return this.state().list.reduce((count, month) =>
      count + month.giorni.reduce((dayCount, day) =>
        dayCount + day.appuntamenti.filter(app => app.selected).length, 0), 0);
  });

  private getInitialData(): Month[] {
    return [
      {
        mese: "Gennaio",
        giorni: [{
          giorno: 2,
          appuntamenti: [{
            id: 1,
            descrizione: "Concerto al palazzetto",
            date: new Date(2025, 0, 2, 20, 0, 0),
            confermato: true,
            selected: false,
          }],
        }, {
          giorno: 12,
          appuntamenti: [{
            id: 2,
            descrizione: "Dentista",
            date: new Date(2025, 0, 12, 12, 0, 0),
            confermato: true,
            selected: false,
          }, {
            id: 3,
            descrizione: "Cena fuori con amici",
            date: new Date(2025, 0, 12, 20, 0, 0),
            confermato: true,
            selected: false,
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
            selected: false,
          }],
        }, {
          giorno: 25,
          appuntamenti: [{
            id: 5,
            descrizione: "Biciclettata",
            date: new Date(2025, 1, 25, 12, 0, 0),
            selected: false,
          }, {
            id: 6,
            descrizione: "Cena fuori con amici",
            date: new Date(2025, 1, 25, 20, 0, 0),
            selected: false,
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
            selected: false,
          }],
        }, {
          giorno: 17,
          appuntamenti: [{
            id: 8,
            descrizione: "Manutenzione auto",
            date: new Date(2025, 2, 17, 12, 0, 0),
            selected: false,
          }, {
            id: 9,
            descrizione: "Cena con colleghi",
            date: new Date(2025, 12, 17, 20, 0, 0),
            selected: false,
          }]
        }]
      }
    ];
  }
}
