import { computed } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { Appointment, Day, Month } from '../models/appointment.model';

export interface AppointmentState {
  mainList: Month[];
  isLoading: boolean;
}

const initialState: AppointmentState = {
  mainList: [],
  isLoading: false,
};

export const AppointmentStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ mainList }) => ({
    selectedAppointmentsCount: computed(() => {
      return mainList().reduce((count, month) =>
        count + month.giorni.reduce((dayCount, day) =>
          dayCount + day.appuntamenti.filter(a => a.selected).length, 0), 0);
    }),
  })),
  withMethods((store) => {
    const localStorageKey = 'todo-app-data';

    const saveAppointments = () => {
      localStorage.setItem(localStorageKey, JSON.stringify(store.mainList()));
    };

    const getMonthName = (date: Date) => {
        const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
        return monthNames[date.getMonth()];
    }

    return {
      loadAppointments() {
        const data = localStorage.getItem(localStorageKey);
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
          patchState(store, { mainList: parsedData });
        } else {
            patchState(store, { mainList: getInitialDummyData() });
        }
      },

      addAppointment(newAppointment: Appointment) {
        patchState(store, (state) => {
            const date = new Date(newAppointment.date);
            const monthName = getMonthName(date);
            const dayNumber = date.getDate();

            const monthExists = state.mainList.some(m => m.mese === monthName);

            let newList = [...state.mainList];

            if (!monthExists) {
                newList.push({ mese: monthName, giorni: [] });
                const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
                newList.sort((a, b) => monthNames.indexOf(a.mese) - monthNames.indexOf(b.mese));
            }

            newList = newList.map(month => {
                if (month.mese !== monthName) return month;

                const dayExists = month.giorni.some(d => d.giorno === dayNumber);
                let newGiorni = [...month.giorni];

                if (!dayExists) {
                    newGiorni.push({ giorno: dayNumber, appuntamenti: [] });
                    newGiorni.sort((a, b) => a.giorno - b.giorno);
                }

                newGiorni = newGiorni.map(day => {
                    if (day.giorno !== dayNumber) return day;
                    const newAppuntamenti = [...day.appuntamenti, { ...newAppointment, selected: false }];
                    newAppuntamenti.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                    return { ...day, appuntamenti: newAppuntamenti };
                });

                return { ...month, giorni: newGiorni };
            });

            return { mainList: newList };
        });
        saveAppointments();
      },

      updateAppointmentSelection(monthName: string, dayNumber: number, appointmentId: number, selected: boolean) {
        patchState(store, (state) => ({
            mainList: state.mainList.map(month =>
                month.mese !== monthName ? month : {
                    ...month,
                    giorni: month.giorni.map(day =>
                        day.giorno !== dayNumber ? day : {
                            ...day,
                            appuntamenti: day.appuntamenti.map(app =>
                                app.id !== appointmentId ? app : { ...app, selected }
                            )
                        }
                    )
                }
            )
        }));
        saveAppointments();
      },

      updateDaySelection(monthName: string, dayNumber: number, selected: boolean) {
        patchState(store, (state) => ({
            mainList: state.mainList.map(month =>
                month.mese !== monthName ? month : {
                    ...month,
                    giorni: month.giorni.map(day =>
                        day.giorno !== dayNumber ? day : {
                            ...day,
                            appuntamenti: day.appuntamenti.map(app => ({ ...app, selected }))
                        }
                    )
                }
            )
        }));
        saveAppointments();
      },

      updateMonthSelection(monthName: string, selected: boolean) {
        patchState(store, (state) => ({
            mainList: state.mainList.map(month =>
                month.mese !== monthName ? month : {
                    ...month,
                    giorni: month.giorni.map(day => ({
                        ...day,
                        appuntamenti: day.appuntamenti.map(app => ({ ...app, selected }))
                    }))
                }
            )
        }));
        saveAppointments();
      },

      confirmSelectedAppointments() {
        patchState(store, (state) => ({
            mainList: state.mainList.map(month => ({
                ...month,
                giorni: month.giorni.map(day => ({
                    ...day,
                    appuntamenti: day.appuntamenti.map(app =>
                        !app.selected ? app : { ...app, confermato: true, annullato: false, selected: false }
                    )
                }))
            }))
        }));
        saveAppointments();
      },

      cancelSelectedAppointments() {
        patchState(store, (state) => ({
            mainList: state.mainList.map(month => ({
                ...month,
                giorni: month.giorni.map(day => ({
                    ...day,
                    appuntamenti: day.appuntamenti.map(app =>
                        !app.selected ? app : { ...app, annullato: true, confermato: false, selected: false }
                    )
                }))
            }))
        }));
        saveAppointments();
      },

      unconfirmSelectedAppointments() {
        patchState(store, (state) => ({
            mainList: state.mainList.map(month => ({
                ...month,
                giorni: month.giorni.map(day => ({
                    ...day,
                    appuntamenti: day.appuntamenti.map(app =>
                        !app.selected ? app : { ...app, confermato: false, annullato: false, selected: false }
                    )
                }))
            }))
        }));
        saveAppointments();
      },

      clearAllData() {
        patchState(store, { mainList: [] });
        localStorage.removeItem(localStorageKey);
      },
    };
  })
);

function getInitialDummyData(): Month[] {
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