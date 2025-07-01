import { Component, Input, computed } from '@angular/core';
import { Day, Appointment } from '../../models/appointment.model';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../services/appointment.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-day-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './day-view.html',
  styleUrl: './day-view.css'
})
export class DayViewComponent {
  @Input() day!: Day;
  @Input() monthName!: string;

  constructor(private appointmentService: AppointmentService) {}

  protected getAppointmentCounts(day: Day) {
    const total = day.appuntamenti.length;
    const confirmed = day.appuntamenti.filter(a => a.confermato).length;
    const cancelled = day.appuntamenti.filter(a => a.annullato).length;
    const toConfirm = total - confirmed - cancelled;
    return { total, confirmed, cancelled, toConfirm };
  }

  allDayAppointmentsSelected = computed(() => {
    return this.day.appuntamenti.every(appointment => appointment.selected);
  });

  isDayIndeterminate = computed(() => {
    const allAppointments = this.day.appuntamenti;
    if (allAppointments.length === 0) {
      return false;
    }
    const selectedAppointments = allAppointments.filter(appointment => appointment.selected);
    return selectedAppointments.length > 0 && selectedAppointments.length < allAppointments.length;
  });

  toggleDaySelection(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.appointmentService.updateDaySelection(this.monthName, this.day.giorno, checked);
  }

  toggleAppointmentSelection(appointment: Appointment, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const monthName = appointment.date.toLocaleString('default', { month: 'long' });
    this.appointmentService.updateAppointmentSelection(monthName, this.day.giorno, appointment.id, checked);
  }
}