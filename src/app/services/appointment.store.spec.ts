import { TestBed } from '@angular/core/testing';
import { AppointmentStore } from './appointment.store';
import { Appointment, Month } from '../models/appointment.model';

describe('AppointmentStore', () => {
  let store: InstanceType<typeof AppointmentStore>;

  // Re-create mock data to avoid state leakage between tests
  const getMockData = (): Month[] => JSON.parse(JSON.stringify([
    {
      mese: "Gennaio",
      giorni: [{
        giorno: 2,
        appuntamenti: [{
          id: 1,
          descrizione: "Test Appointment 1",
          date: new Date(2025, 0, 2, 10, 0, 0),
          confermato: false,
          annullato: false,
          selected: false,
        }],
      }, {
        giorno: 12,
        appuntamenti: [{
          id: 2,
          descrizione: "Test Appointment 2",
          date: new Date(2025, 0, 12, 12, 0, 0),
          confermato: true,
          selected: false,
        }]
      }]
    }
  ]));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppointmentStore]
    });

    store = TestBed.inject(AppointmentStore);
    
    // Set initial state by calling the store's methods
    store.clearAllData();
    getMockData().forEach(month => {
        month.giorni.forEach(day => {
            day.appuntamenti.forEach(app => store.addAppointment(app));
        });
    });
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should add a new appointment to an existing day', () => {
    const newAppointment: Appointment = {
      id: 3,
      descrizione: "New Test Appointment",
      date: new Date(2025, 0, 2, 14, 0, 0),
    };
    store.addAppointment(newAppointment);
    const month = store.mainList().find((m: Month) => m.mese === 'Gennaio');
    const day = month?.giorni.find(d => d.giorno === 2);
    expect(day?.appuntamenti.length).toBe(2);
    expect(day?.appuntamenti.find(a => a.id === 3)?.descrizione).toBe("New Test Appointment");
  });

  it('should add a new appointment to a new month and day', () => {
    const newAppointment: Appointment = {
      id: 4,
      descrizione: "Feb Appointment",
      date: new Date(2025, 1, 15, 10, 0, 0),
    };
    store.addAppointment(newAppointment);
    const month = store.mainList().find((m: Month) => m.mese === 'Febbraio');
    expect(month).toBeTruthy();
    const day = month?.giorni.find(d => d.giorno === 15);
    expect(day).toBeTruthy();
    expect(day?.appuntamenti.length).toBe(1);
    expect(day?.appuntamenti[0].descrizione).toBe("Feb Appointment");
  });

  it('should update appointment selection', () => {
    store.updateAppointmentSelection("Gennaio", 2, 1, true);
    const appointment = store.mainList()[0].giorni[0].appuntamenti[0];
    expect(appointment.selected).toBe(true);
  });

  it('should update day selection', () => {
    store.updateDaySelection("Gennaio", 12, true);
    const appointments = store.mainList()[0].giorni[1].appuntamenti;
    expect(appointments.every((a: Appointment) => a.selected)).toBe(true);
  });

  it('should update month selection', () => {
    store.updateMonthSelection("Gennaio", true);
    const allAppointments = store.mainList()[0].giorni.flatMap(d => d.appuntamenti);
    expect(allAppointments.every((a: Appointment) => a.selected)).toBe(true);
  });

  it('should confirm selected appointments', () => {
    store.updateAppointmentSelection("Gennaio", 2, 1, true);
    store.confirmSelectedAppointments();
    const appointment = store.mainList()[0].giorni[0].appuntamenti[0];
    expect(appointment.confermato).toBe(true);
    expect(appointment.annullato).toBe(false);
    expect(appointment.selected).toBe(false);
  });

  it('should cancel selected appointments', () => {
    store.updateAppointmentSelection("Gennaio", 2, 1, true);
    store.cancelSelectedAppointments();
    const appointment = store.mainList()[0].giorni[0].appuntamenti[0];
    expect(appointment.annullato).toBe(true);
    expect(appointment.confermato).toBe(false);
    expect(appointment.selected).toBe(false);
  });

  it('should unconfirm selected appointments', () => {
    store.updateAppointmentSelection("Gennaio", 12, 2, true);
    store.confirmSelectedAppointments();
    let appointment = store.mainList()[0].giorni[1].appuntamenti[0];
    expect(appointment.confermato).toBe(true);

    store.updateAppointmentSelection("Gennaio", 12, 2, true);
    store.unconfirmSelectedAppointments();
    appointment = store.mainList()[0].giorni[1].appuntamenti[0];
    expect(appointment.confermato).toBe(false);
    expect(appointment.annullato).toBe(false);
    expect(appointment.selected).toBe(false);
  });

  it('should correctly calculate selectedAppointmentsCount', () => {
    expect(store.selectedAppointmentsCount()).toBe(0);
    store.updateAppointmentSelection("Gennaio", 2, 1, true);
    expect(store.selectedAppointmentsCount()).toBe(1);
    store.updateDaySelection("Gennaio", 12, true);
    expect(store.selectedAppointmentsCount()).toBe(2);
    store.updateAppointmentSelection('Gennaio', 2, 1, false);
    expect(store.selectedAppointmentsCount()).toBe(1);
  });

  it('should save to and load from localStorage', () => {
    store.addAppointment({ id: 5, descrizione: "Storage Test", date: new Date(2025, 0, 5) });
    
    const newStore = TestBed.inject(AppointmentStore);
    newStore.loadAppointments();

    const month = newStore.mainList().find((m: Month) => m.mese === 'Gennaio');
    const day = month?.giorni.find(d => d.giorno === 5);
    expect(day?.appuntamenti.find(a => a.id === 5)?.descrizione).toBe("Storage Test");
  });
});