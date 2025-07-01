import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppointmentService } from './services/appointment.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonthViewComponent } from './app/month-view/month-view';
import { DayViewComponent } from './app/day-view/day-view';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, MonthViewComponent, DayViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'todo-checkbox-app';
  protected newAppointmentDescription: string = '';
  protected newAppointmentDate: string = '';

  constructor(protected appointmentService: AppointmentService) {}

  protected addAppointment() {
    if (this.newAppointmentDescription && this.newAppointmentDate) {
      const newId = this.appointmentService.mainList().flatMap(m => m.giorni).flatMap(d => d.appuntamenti).length + 1;
      this.appointmentService.addAppointment({
        id: newId,
        descrizione: this.newAppointmentDescription,
        date: new Date(this.newAppointmentDate),
      });
      this.newAppointmentDescription = '';
      this.newAppointmentDate = '';
    }
  }

  protected confirmSelected() {
    this.appointmentService.confirmSelectedAppointments();
  }

  protected cancelSelected() {
    this.appointmentService.cancelSelectedAppointments();
  }

  protected unconfirmSelected() {
    this.appointmentService.unconfirmSelectedAppointments();
  }

  protected clearAllData() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      this.appointmentService.clearAllData();
    }
  }
}
