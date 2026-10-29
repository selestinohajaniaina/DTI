import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LucideAngularModule } from 'lucide-angular';

import type { GeneratedIdea } from '../../../services/api.service';
import { APP_ICONS } from '../../../shared/icons';
import { TutorialModal } from './tutorial-modal.component';

const IDEA: GeneratedIdea = {
  id: 'idea-1',
  title: 'Mini Vase',
  description: 'A colorful second life.',
  difficulty: 'Easy',
  estimatedMinutes: 90,
  image: { url: null, status: 'failed' },
  marketPrice: {
    status: 'estimated',
    currency: 'MGA',
    estimatedCost: 800,
    estimatedSellingPrice: 3000,
  },
  tutorial: {
    materials: ['Clean cup'],
    tools: ['Paintbrush'],
    steps: [{ step: 1, title: 'Clean the cup', description: 'Wash and dry it thoroughly.' }],
    safetyNotes: ['Wear gloves'],
  },
};

describe('TutorialModal', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialModal],
      providers: [importProvidersFrom(LucideAngularModule.pick(APP_ICONS))],
    }).compileComponents();
  });

  it('renders materials, tools, steps and safety notes', () => {
    const fixture = TestBed.createComponent(TutorialModal);
    fixture.componentRef.setInput('idea', IDEA);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Mini Vase');
    expect(compiled.textContent).toContain('1 h 30 min');
    expect(compiled.textContent).toContain('Clean cup');
    expect(compiled.textContent).toContain('Paintbrush');
    expect(compiled.textContent).toContain('Wash and dry it thoroughly.');
    expect(compiled.textContent).toContain('Wear gloves');
  });

  it('emits closed when the close button is clicked', () => {
    const fixture = TestBed.createComponent(TutorialModal);
    fixture.componentRef.setInput('idea', IDEA);
    let closed = false;
    fixture.componentInstance.closed.subscribe(() => {
      closed = true;
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const closeButton = compiled.querySelector(
      'button[aria-label="Close tutorial"]',
    ) as HTMLButtonElement | null;
    closeButton?.click();

    expect(closed).toBe(true);
  });
});
