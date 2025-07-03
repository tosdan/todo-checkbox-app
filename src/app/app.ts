import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MonthViewComponent } from './app/month-view/month-view';
import { DayViewComponent } from './app/day-view/day-view';
import { AppointmentStore } from './services/appointment.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, MonthViewComponent, DayViewComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly store = inject(AppointmentStore);
  protected newAppointmentDescription: string = '';
  protected newAppointmentDate: string = '';

  ngOnInit(): void {
    this.store.loadAppointments();
  }

  protected addAppointment() {
    if (this.newAppointmentDescription && this.newAppointmentDate) {
      const newId = this.store.mainList().flatMap(m => m.giorni).flatMap(d => d.appuntamenti).length + 1;
      this.store.addAppointment({
        id: newId,
        descrizione: this.newAppointmentDescription,
        date: new Date(this.newAppointmentDate),
      });
      this.newAppointmentDescription = '';
      this.newAppointmentDate = '';
    }
  }

  protected confirmSelected() {
    this.store.confirmSelectedAppointments();
  }

  protected cancelSelected() {
    this.store.cancelSelectedAppointments();
  }

  protected unconfirmSelected() {
    this.store.unconfirmSelectedAppointments();
  }

  protected clearAllData() {
    if (confirm('Sei sicuro di voler cancellare tutti i dati?')) {
      this.store.clearAllData();
    }
  }
}
