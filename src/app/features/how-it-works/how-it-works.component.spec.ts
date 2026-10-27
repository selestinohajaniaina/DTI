import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../shared/icons';
import { HowItWorks } from './how-it-works.component';

describe('HowItWorks', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HowItWorks],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick(APP_ICONS)),
      ],
    }).compileComponents();
  });

  it('should create the how-it-works page', () => {
    const fixture = TestBed.createComponent(HowItWorks);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('forgotten object');
  });
});
