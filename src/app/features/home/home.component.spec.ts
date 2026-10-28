import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { APP_ICONS } from '../../shared/icons';
import type { GenerateIdeasResult } from '../../services/api.service';
import { Home } from './home.component';

const MOCK_RESULT: GenerateIdeasResult = {
  sourceObject: { name: 'Cup', material: 'plastic', condition: 'reusable' },
  ideas: [1, 2, 3].map((index) => ({
    id: `idea-${index}`,
    title: `Idea ${index}`,
    description: `Description ${index}`,
    difficulty: 'Easy',
    estimatedMinutes: 15,
    image: { url: `/uploads/generated/idea-${index}.png`, status: 'completed' as const },
    marketPrice: {
      status: 'not_found' as const,
      amount: null,
      currency: null,
      sourceUrl: null,
      listingTitle: null,
    },
    tutorial: {
      materials: ['Paint'],
      tools: ['Brush'],
      steps: [{ step: 1, title: 'Do it', description: 'Do it well.' }],
      safetyNotes: [],
    },
  })),
};

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick(APP_ICONS)),
        provideHttpClient(),
      ],
    }).compileComponents();
  });

  it('should create the home page', () => {
    const fixture = TestBed.createComponent(Home);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the slogan and upload area', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('One photo.');
    expect(compiled.querySelector('#upload')).toBeTruthy();
  });

  it('should render three transformation examples', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const articles = compiled.querySelectorAll(
      'section[aria-labelledby="examples-heading"] article',
    );
    expect(articles.length).toBe(3);
  });

  it('should render three idea cards after a successful generation', async () => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick(APP_ICONS)),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    await TestBed.compileComponents();
    const http = TestBed.inject(HttpTestingController);
    try {
      const fixture = TestBed.createComponent(Home);
      fixture.detectChanges();
      selectPhoto(fixture.nativeElement as HTMLElement);
      await fixture.whenStable();
      fixture.detectChanges();

      const button = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ).find((entry) => entry.textContent?.includes('Generate Ideas'));
      expect(button?.disabled).toBe(false);
      button?.click();

      const req = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
      expect(req.request.method).toBe('POST');
      req.flush({ success: true, data: MOCK_RESULT });
      fixture.detectChanges();
      await fixture.whenStable();

      const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('#results article');
      expect(cards.length).toBe(3);
      expect(cards[0]?.querySelector('h3')?.textContent).toContain('Idea 1');
    } finally {
      http.verify();
    }
  });

  it('should show an error message when generation fails', async () => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick(APP_ICONS)),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    await TestBed.compileComponents();
    const http = TestBed.inject(HttpTestingController);
    try {
      const fixture = TestBed.createComponent(Home);
      fixture.detectChanges();
      selectPhoto(fixture.nativeElement as HTMLElement);
      await fixture.whenStable();
      fixture.detectChanges();

      const button = Array.from(
        (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ).find((entry) => entry.textContent?.includes('Generate Ideas'));
      button?.click();

      const req = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
      req.flush(
        { success: false, error: { code: 'AI_UPSTREAM_ERROR', message: 'Meta AI request failed' } },
        { status: 502, statusText: 'Bad Gateway' },
      );
      fixture.detectChanges();
      await fixture.whenStable();

      const alerts = (fixture.nativeElement as HTMLElement).querySelectorAll('[role="alert"]');
      expect(Array.from(alerts).some((alert) => alert.textContent?.includes('Meta AI'))).toBe(true);
    } finally {
      http.verify();
    }
  });
});

function selectPhoto(compiled: HTMLElement): void {
  const input = compiled.querySelector('input[type="file"]') as HTMLInputElement | null;
  if (!input) {
    throw new Error('file input not found');
  }
  // No DataTransfer in this test environment: stub a minimal FileList instead.
  const file = new File(['bytes'], 'cup.png', { type: 'image/png' });
  const fileList = { 0: file, length: 1, item: (index: number) => (index === 0 ? file : null) };
  Object.defineProperty(input, 'files', { value: fileList, configurable: true });
  input.dispatchEvent(new Event('change'));
}
