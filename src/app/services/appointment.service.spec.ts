import { TestBed } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';
import { Appointment, Month } from '../models/appointment.model';
import { signal } from '@angular/core';

describe('AppointmentService', () => {
  let service: AppointmentService;
  const localStorageKey = 'todo-app-data';

  const mockData: Month[] = [
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
  ];

  beforeEach(() => {
    // Reset localStorage before each test to ensure isolation
    localStorage.removeItem(localStorageKey);

    TestBed.configureTestingModule({
      providers: [AppointmentService]
    });
    service = TestBed.inject(AppointmentService);

    // Set initial data for tests
    service.mainList.set(JSON.parse(JSON.stringify(mockData))); // Deep copy
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add a new appointment to an existing day', () => {
    const newAppointment: Appointment = {
      id: 3,
      descrizione: "New Test Appointment",
      date: new Date(2025, 0, 2, 14, 0, 0),
    };
    service.addAppointment(newAppointment);
    const month = service.mainList().find(m => m.mese === 'Gennaio');
    const day = month?.giorni.find(d => d.giorno === 2);
    expect(day?.appuntamenti.length).toBe(2);
    expect(day?.appuntamenti[1].descrizione).toBe("New Test Appointment");
  });

  it('should add a new appointment to a new month and day', () => {
    const newAppointment: Appointment = {
      id: 4,
      descrizione: "Feb Appointment",
      date: new Date(2025, 1, 15, 10, 0, 0),
    };
    service.addAppointment(newAppointment);
    const month = service.mainList().find(m => m.mese === 'Febbraio');
    expect(month).toBeTruthy();
    const day = month?.giorni.find(d => d.giorno === 15);
    expect(day).toBeTruthy();
    expect(day?.appuntamenti.length).toBe(1);
    expect(day?.appuntamenti[0].descrizione).toBe("Feb Appointment");
  });

  it('should update appointment selection', () => {
    service.updateAppointmentSelection("Gennaio", 2, 1, true);
    const appointment = service.mainList()[0].giorni[0].appuntamenti[0];
    expect(appointment.selected).toBe(true);
  });

  it('should update day selection', () => {
    service.updateDaySelection("Gennaio", 12, true);
    const appointments = service.mainList()[0].giorni[1].appuntamenti;
    expect(appointments.every(a => a.selected)).toBe(true);
  });

  it('should update month selection', () => {
    service.updateMonthSelection("Gennaio", true);
    const allAppointments = service.mainList()[0].giorni.flatMap(d => d.appuntamenti);
    expect(allAppointments.every(a => a.selected)).toBe(true);
  });

  it('should confirm selected appointments', () => {
    service.updateAppointmentSelection("Gennaio", 2, 1, true);
    service.confirmSelectedAppointments();
    const appointment = service.mainList()[0].giorni[0].appuntamenti[0];
    expect(appointment.confermato).toBe(true);
    expect(appointment.annullato).toBe(false);
    expect(appointment.selected).toBe(false);
  });

  it('should cancel selected appointments', () => {
    service.updateAppointmentSelection("Gennaio", 2, 1, true);
    service.cancelSelectedAppointments();
    const appointment = service.mainList()[0].giorni[0].appuntamenti[0];
    expect(appointment.annullato).toBe(true);
    expect(appointment.confermato).toBe(false);
    expect(appointment.selected).toBe(false);
  });

  it('should unconfirm selected appointments', () => {
    // First, confirm it
    service.updateAppointmentSelection("Gennaio", 12, 2, true);
    service.confirmSelectedAppointments();
    let appointment = service.mainList()[0].giorni[1].appuntamenti[0];
    expect(appointment.confermato).toBe(true);

    // Then, unconfirm it
    service.updateAppointmentSelection("Gennaio", 12, 2, true);
    service.unconfirmSelectedAppointments();
    appointment = service.mainList()[0].giorni[1].appuntamenti[0];
    expect(appointment.confermato).toBe(false);
    expect(appointment.annullato).toBe(false);
    expect(appointment.selected).toBe(false);
  });

  it('should correctly calculate selectedAppointmentsCount', () => {
    expect(service.selectedAppointmentsCount()).toBe(0);
    service.updateAppointmentSelection("Gennaio", 2, 1, true);
    expect(service.selectedAppointmentsCount()).toBe(1);
    service.updateDaySelection("Gennaio", 12, true);
    expect(service.selectedAppointmentsCount()).toBe(2);
    service.updateAppointmentSelection("Gennaio", 2, 1, false);
    expect(service.selectedAppointmentsCount()).toBe(1);
  });

  it('should save to and load from localStorage', () => {
    // Modify data and save
    service.addAppointment({ id: 5, descrizione: "Storage Test", date: new Date(2025, 0, 5) });
    service.saveAppointments();

    // Create a new service instance to force a load
    const newService = new AppointmentService();
    const month = newService.mainList().find(m => m.mese === 'Gennaio');
    const day = month?.giorni.find(d => d.giorno === 5);
    expect(day?.appuntamenti[0].descrizione).toBe("Storage Test");
  });
});
