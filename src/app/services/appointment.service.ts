import { Injectable, signal, computed } from '@angular/core';
import { produce } from 'immer';
import { Appointment, Day, Month } from '../models/appointment.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  mainList = signal<Month[]>([]);
  private localStorageKey = 'todo-app-data';

  constructor() {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    const data = localStorage.getItem(this.localStorageKey);
    if (data) {
      const parsedData: Month[] = JSON.parse(data);
      // Convert date strings back to Date objects and ensure 'selected' property
      parsedData.forEach(month => {
        month.giorni.forEach(day => {
          day.appuntamenti.forEach(appointment => {
            appointment.date = new Date(appointment.date);
            appointment.selected = false; // Initialize selected state
          });
        });
      });
      this.mainList.set(parsedData);
    } else {
      // Initialize with some dummy data if localStorage is empty
      this.mainList.set([
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
      ]);
    }
  }

  saveAppointments(): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this.mainList()));
  }

  addAppointment(newAppointment: Appointment): void {
    this.mainList.update(list => produce(list, draft => {
      const date = new Date(newAppointment.date);
      const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
      const monthName = monthNames[date.getMonth()];
      const dayNumber = date.getDate();

      let monthIndex = draft.findIndex(m => m.mese === monthName);

      if (monthIndex === -1) {
        draft.push({ mese: monthName, giorni: [] });
        draft.sort((a, b) => {
          const monthOrder = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
          return monthOrder.indexOf(a.mese) - monthOrder.indexOf(b.mese);
        });
        monthIndex = draft.findIndex(m => m.mese === monthName);
      }

      let dayIndex = draft[monthIndex].giorni.findIndex(d => d.giorno === dayNumber);

      if (dayIndex === -1) {
        draft[monthIndex].giorni.push({ giorno: dayNumber, appuntamenti: [] });
        draft[monthIndex].giorni.sort((a, b) => a.giorno - b.giorno);
        dayIndex = draft[monthIndex].giorni.findIndex(d => d.giorno === dayNumber);
      }

      draft[monthIndex].giorni[dayIndex].appuntamenti.push({ ...newAppointment, selected: false });
      draft[monthIndex].giorni[dayIndex].appuntamenti.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }));
    this.saveAppointments();
  }

  clearAllData(): void {
    localStorage.removeItem(this.localStorageKey);
    this.mainList.set([]);
  }

  updateAppointmentSelection(monthName: string, dayNumber: number, appointmentId: number, selected: boolean): void {
    this.mainList.update(list => produce(list, draft => {
      const month = draft.find(m => m.mese === monthName);
      if (month) {
        const day = month.giorni.find(d => d.giorno === dayNumber);
        if (day) {
          const appointment = day.appuntamenti.find(a => a.id === appointmentId);
          if (appointment) {
            appointment.selected = selected;
          }
        }
      }
    }));
    this.saveAppointments();
  }

  updateDaySelection(monthName: string, dayNumber: number, selected: boolean): void {
    this.mainList.update(list => produce(list, draft => {
      const month = draft.find(m => m.mese === monthName);
      if (month) {
        const day = month.giorni.find(d => d.giorno === dayNumber);
        if (day) {
          day.appuntamenti.forEach(a => a.selected = selected);
        }
      }
    }));
    this.saveAppointments();
  }

  updateMonthSelection(monthName: string, selected: boolean): void {
    this.mainList.update(list => produce(list, draft => {
      const month = draft.find(m => m.mese === monthName);
      if (month) {
        month.giorni.forEach(day => {
          day.appuntamenti.forEach(a => a.selected = selected);
        });
      }
    }));
    this.saveAppointments();
  }

  confirmSelectedAppointments(): void {
    this.mainList.update(list => produce(list, draft => {
      draft.forEach(month => {
        month.giorni.forEach(day => {
          day.appuntamenti.forEach(appointment => {
            if (appointment.selected) {
              appointment.confermato = true;
              appointment.annullato = false;
              appointment.selected = false;
            }
          });
        });
      });
    }));
    this.saveAppointments();
  }

  cancelSelectedAppointments(): void {
    this.mainList.update(list => produce(list, draft => {
      draft.forEach(month => {
        month.giorni.forEach(day => {
          day.appuntamenti.forEach(appointment => {
            if (appointment.selected) {
              appointment.annullato = true;
              appointment.confermato = false;
              appointment.selected = false;
            }
          });
        });
      });
    }));
    this.saveAppointments();
  }

  unconfirmSelectedAppointments(): void {
    this.mainList.update(list => produce(list, draft => {
      draft.forEach(month => {
        month.giorni.forEach(day => {
          day.appuntamenti.forEach(appointment => {
            if (appointment.selected) {
              appointment.confermato = false;
              appointment.annullato = false;
              appointment.selected = false;
            }
          });
        });
      });
    }));
    this.saveAppointments();
  }

  selectedAppointmentsCount = computed(() => {
    let count = 0;
    this.mainList().forEach(month => {
      month.giorni.forEach(day => {
        day.appuntamenti.forEach(appointment => {
          if (appointment.selected) {
            count++;
          }
        });
      });
    });
    return count;
  });
}
