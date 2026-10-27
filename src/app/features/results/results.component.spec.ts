import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../shared/icons';
import { Results } from './results.component';

describe('Results', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Results],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick(APP_ICONS)),
      ],
    }).compileComponents();
  });

  it('should create the results placeholder page', () => {
    const fixture = TestBed.createComponent(Results);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('reuse ideas');
  });
});
