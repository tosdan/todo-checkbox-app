import { Component, Input, computed } from '@angular/core';
import { Month } from '../../models/appointment.model';
import { CommonModule } from '@angular/common';
import { DayViewComponent } from '../day-view/day-view';
import { AppointmentService } from '../../services/appointment.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-month-view',
  standalone: true,
  imports: [CommonModule, DayViewComponent, FormsModule],
  templateUrl: './month-view.html',
  styleUrl: './month-view.css'
})
export class MonthViewComponent {
  @Input() monthName!: string;

  constructor(private appointmentService: AppointmentService) {}

  currentMonth = computed(() => {
    return this.appointmentService.mainList().find(m => m.mese === this.monthName);
  });

  allMonthAppointmentsSelected = computed(() => {
    const month = this.currentMonth();
    if (!month) return false;
    return month.giorni.every(day =>
      day.appuntamenti.every(appointment => appointment.selected)
    );
  });

  isMonthIndeterminate = computed(() => {
    const month = this.currentMonth();
    if (!month) return false;
    const allAppointments = month.giorni.flatMap(day => day.appuntamenti);
    if (allAppointments.length === 0) {
      return false;
    }
    const selectedAppointments = allAppointments.filter(appointment => appointment.selected);
    return selectedAppointments.length > 0 && selectedAppointments.length < allAppointments.length;
  });

  toggleMonthSelection(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.appointmentService.updateMonthSelection(this.monthName, checked);
  }
}
