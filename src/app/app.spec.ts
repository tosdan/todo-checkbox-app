import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { AppointmentStore } from './services/appointment.store';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [AppointmentStore]
    }).compileComponents();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges(); // This will trigger ngOnInit and load the data
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Gestione Appuntamenti');
  });
});
