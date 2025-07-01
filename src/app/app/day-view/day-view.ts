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
  @Input() dayNumber!: number;
  @Input() monthName!: string;

  constructor(private appointmentService: AppointmentService) {}

  currentDay = computed(() => {
    const month = this.appointmentService.mainList().find(m => m.mese === this.monthName);
    return month?.giorni.find(day => day.giorno === this.dayNumber);
  });

  protected getAppointmentCounts() {
    const day = this.currentDay();
    if (!day) return { total: 0, confirmed: 0, cancelled: 0, toConfirm: 0 };
    const total = day.appuntamenti.length;
    const confirmed = day.appuntamenti.filter(a => a.confermato).length;
    const cancelled = day.appuntamenti.filter(a => a.annullato).length;
    const toConfirm = total - confirmed - cancelled;
    return { total, confirmed, cancelled, toConfirm };
  }

  allDayAppointmentsSelected = computed(() => {
    const day = this.currentDay();
    if (!day) return false;
    return day.appuntamenti.every(appointment => appointment.selected);
  });

  isDayIndeterminate = computed(() => {
    const day = this.currentDay();
    if (!day) return false;
    const allAppointments = day.appuntamenti;
    if (allAppointments.length === 0) {
      return false;
    }
    const selectedAppointments = allAppointments.filter(appointment => appointment.selected);
    return selectedAppointments.length > 0 && selectedAppointments.length < allAppointments.length;
  });

  toggleDaySelection(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.appointmentService.updateDaySelection(this.monthName, this.dayNumber, checked);
  }

  toggleAppointmentSelection(appointment: Appointment, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.appointmentService.updateAppointmentSelection(this.monthName, this.dayNumber, appointment.id, checked);
  }
}