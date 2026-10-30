import { provideHttpClient } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../shared/icons';
import type { GeneratedIdea } from '../../services/api.service';
import { CardGeneratedIdea } from './card-generated-idea.component';

const MOCK_IDEA: GeneratedIdea = {
  id: 'idea-1',
  title: 'Mini Vase',
  description: 'A colorful second life.',
  difficulty: 'Easy',
  estimatedMinutes: 15,
  image: { url: '/uploads/generated/vase.png', status: 'completed' },
  marketPrice: {
    status: 'estimated',
    currency: 'USD',
    estimatedCost: 2.5,
    estimatedSellingPrice: 8,
  },
  tutorial: { materials: [], tools: [], steps: [], safetyNotes: [] },
};

describe('CardGeneratedIdea', () => {
  let component: CardGeneratedIdea;
  let fixture: ComponentFixture<CardGeneratedIdea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardGeneratedIdea],
      providers: [provideHttpClient(), importProvidersFrom(LucideAngularModule.pick(APP_ICONS))],
    }).compileComponents();

    fixture = TestBed.createComponent(CardGeneratedIdea);
    component = fixture.componentInstance;
    component.idea = MOCK_IDEA;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders title, price and tutorial button', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h3')?.textContent).toContain('Mini Vase');
    expect(compiled.textContent).toContain('Estimated selling price');
    expect(compiled.textContent).toContain('$8.00');
    expect(compiled.textContent).toContain('View Tutorial');
  });

  it('shows the source line only when library context is provided', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('From Bottle');

    component.sourceName = 'Bottle';
    component.createdAt = '2026-03-04T00:00:00.000Z';
    fixture.detectChanges();
    expect(compiled.textContent).toContain('From Bottle');
    expect(compiled.textContent).toContain('Mar 4, 2026');
  });

  it('emits the idea when the tutorial button is clicked', () => {
    let emitted: GeneratedIdea | null = null;
    component.tutorielIdeaEmiter.subscribe((idea) => {
      emitted = idea;
    });

    const button = (fixture.nativeElement as HTMLElement).querySelector('button');
    button?.click();

    expect(emitted).toBe(MOCK_IDEA);
  });
});
