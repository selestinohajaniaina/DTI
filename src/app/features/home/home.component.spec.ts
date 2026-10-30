import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { vi } from 'vitest';

import { APP_ICONS } from '../../shared/icons';
import type { GenerateIdeasResult } from '../../services/api.service';
import { Home } from './home.component';

const MOCK_RESULT: GenerateIdeasResult = {
  sourceObject: { name: 'Cup', material: 'plastic', condition: 'reusable' },
  anonymousOwnerId: null,
  ideas: [1, 2, 3].map((index) => ({
    id: `idea-${index}`,
    title: `Idea ${index}`,
    description: `Description ${index}`,
    difficulty: 'Easy',
    estimatedMinutes: 15,
    image: { url: `/uploads/generated/idea-${index}.png`, status: 'completed' as const },
    marketPrice: {
      status: 'estimated' as const,
      currency: 'MGA' as const,
      estimatedCost: 800 * index,
      estimatedSellingPrice: 3000 * index,
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

  beforeEach(() => {
    // The test DOM lacks these browser APIs, exercised by scrollToResults()
    // after every successful generation.
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: false }) as MediaQueryList,
      configurable: true,
      writable: true,
    });
    Element.prototype.scrollIntoView = () => undefined;
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

  it('should render estimated prices on each idea card', async () => {
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
      req.flush({ success: true, data: MOCK_RESULT });
      fixture.detectChanges();
      await fixture.whenStable();

      const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('#results article');
      expect(cards.length).toBe(3);
      const firstCard = cards[0]?.textContent ?? '';
      expect(firstCard).toContain('Estimated selling price');
      expect(firstCard).toContain('Ar 3,000');
      // Cost display was deliberately removed from the card (selling price
      // only); lock that contract instead of the stale assertion.
      expect(firstCard).not.toContain('Estimated cost to make');
    } finally {
      http.verify();
    }
  });

  it('should handle null prices without breaking the idea cards', async () => {
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

      const nullPrices: GenerateIdeasResult = {
        ...MOCK_RESULT,
        ideas: MOCK_RESULT.ideas.map((idea) => ({
          ...idea,
          marketPrice: {
            status: 'estimated' as const,
            currency: 'MGA' as const,
            estimatedCost: null,
            estimatedSellingPrice: null,
          },
        })),
      };
      const req = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
      req.flush({ success: true, data: nullPrices });
      fixture.detectChanges();
      await fixture.whenStable();

      const cards = (fixture.nativeElement as HTMLElement).querySelectorAll('#results article');
      expect(cards.length).toBe(3);
      expect(cards[0]?.textContent).toContain('Not available');
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

  describe('loading messages', () => {
    async function startGeneration(): Promise<{
      fixture: ComponentFixture<Home>;
      http: HttpTestingController;
    }> {
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
      const fixture = TestBed.createComponent(Home);
      fixture.detectChanges();
      selectPhoto(fixture.nativeElement as HTMLElement);
      await fixture.whenStable();
      fixture.detectChanges();
      return { fixture, http };
    }

    function loadingHeading(compiled: HTMLElement): string {
      return compiled.querySelector('#results-heading')?.textContent?.trim() ?? '';
    }

    function loadingStatus(compiled: HTMLElement): string {
      return compiled.querySelector('[role="status"]')?.textContent ?? '';
    }

    it('rotates heading and detail independently, then stops on success', async () => {
      const { fixture, http } = await startGeneration();
      const compiled = fixture.nativeElement as HTMLElement;
      vi.useFakeTimers();
      try {
        clickGenerate(compiled);
        fixture.detectChanges();

        expect(loadingHeading(compiled)).toContain('Imagining new possibilities');
        expect(loadingStatus(compiled)).toContain('Taking a closer look');

        // Heading interval (2.5 s) fires while the detail (3.7 s) stays put.
        vi.advanceTimersByTime(2500);
        fixture.detectChanges();
        expect(loadingHeading(compiled)).toContain('Giving your object a second life');
        expect(loadingStatus(compiled)).toContain('Taking a closer look');

        vi.advanceTimersByTime(1200);
        fixture.detectChanges();
        expect(loadingStatus(compiled)).toContain('Exploring creative ways to reuse');

        // A long wait keeps rotating without errors.
        vi.advanceTimersByTime(30000);
        fixture.detectChanges();
        expect(loadingHeading(compiled)).toBeTruthy();

        const req = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
        req.flush({ success: true, data: MOCK_RESULT });
        fixture.detectChanges();
        expect(loadingHeading(compiled)).toContain('Second lives for your Cup');

        // Rotation stopped: further ticks change nothing.
        vi.advanceTimersByTime(10000);
        fixture.detectChanges();
        expect(loadingHeading(compiled)).toContain('Second lives for your Cup');
      } finally {
        vi.useRealTimers();
        http.verify();
      }
    });

    it('stops on failure and restarts from the first message on retry', async () => {
      const { fixture, http } = await startGeneration();
      const compiled = fixture.nativeElement as HTMLElement;
      vi.useFakeTimers();
      try {
        clickGenerate(compiled);
        fixture.detectChanges();
        vi.advanceTimersByTime(2500);
        fixture.detectChanges();
        expect(loadingHeading(compiled)).toContain('Giving your object a second life');

        const failed = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
        failed.flush(
          { success: false, error: { code: 'AI_UPSTREAM_ERROR', message: 'Meta AI failed' } },
          { status: 502, statusText: 'Bad Gateway' },
        );
        fixture.detectChanges();
        expect(compiled.querySelector('#results-heading')).toBeNull();

        // Timers are dead: nothing to advance.
        vi.advanceTimersByTime(5000);
        fixture.detectChanges();

        // A retry restarts the sequence (a surviving old loop would skip ahead).
        clickGenerate(compiled);
        fixture.detectChanges();
        expect(loadingHeading(compiled)).toContain('Imagining new possibilities');
        vi.advanceTimersByTime(2500);
        fixture.detectChanges();
        expect(loadingHeading(compiled)).toContain('Giving your object a second life');

        const retry = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
        retry.flush({ success: true, data: MOCK_RESULT });
        fixture.detectChanges();
        expect(loadingHeading(compiled)).toContain('Second lives for your Cup');
      } finally {
        vi.useRealTimers();
        http.verify();
      }
    });

    it('plays exit-and-entry transitions while keeping the shimmer wrapper stable', async () => {
      const { fixture, http } = await startGeneration();
      const compiled = fixture.nativeElement as HTMLElement;
      vi.useFakeTimers();
      try {
        clickGenerate(compiled);
        fixture.detectChanges();

        const shimmer = compiled.querySelector('#results-heading .loading-heading-shimmer');
        expect(shimmer).not.toBeNull();
        expect(compiled.querySelector('.loading-icon-glow')).not.toBeNull();
        expect(compiled.querySelector('#results-heading .loading-message--exit')).toBeNull();

        // Rotation mounts the outgoing message beside the incoming one.
        vi.advanceTimersByTime(2500);
        fixture.detectChanges();
        const heading = compiled.querySelector('#results-heading');
        expect(heading?.querySelector('.loading-message--exit')?.textContent).toContain(
          'Imagining new possibilities',
        );
        expect(heading?.querySelector('.loading-message--enter')?.textContent).toContain(
          'Giving your object a second life',
        );
        // Same shimmer node: the gradient animation never restarts.
        expect(compiled.querySelector('#results-heading .loading-heading-shimmer')).toBe(shimmer);

        // Past the 220 ms exit, only the incoming message remains.
        vi.advanceTimersByTime(220);
        fixture.detectChanges();
        expect(compiled.querySelector('#results-heading .loading-message--exit')).toBeNull();
        expect(loadingHeading(compiled)).toContain('Giving your object a second life');

        // Detail swaps independently with its own exit element.
        vi.advanceTimersByTime(3700 - 2500 - 220);
        fixture.detectChanges();
        expect(
          compiled.querySelector('[role="status"] .loading-detail--exit')?.textContent,
        ).toContain('Taking a closer look');
        expect(
          compiled.querySelector('[role="status"] .loading-detail--enter')?.textContent,
        ).toContain('Exploring creative ways to reuse');

        const req = http.expectOne('http://127.0.0.1:3000/api/ai/generate-ideas');
        req.flush({ success: true, data: MOCK_RESULT });
        fixture.detectChanges();
        expect(compiled.querySelector('.loading-heading-shimmer')).toBeNull();
        expect(compiled.querySelector('[role="status"]')).toBeNull();
      } finally {
        vi.useRealTimers();
        http.verify();
      }
    });

    it('survives component destruction while loading', async () => {
      const { fixture } = await startGeneration();
      const compiled = fixture.nativeElement as HTMLElement;
      vi.useFakeTimers();
      try {
        clickGenerate(compiled);
        fixture.detectChanges();
        vi.advanceTimersByTime(1000);

        expect(() => {
          fixture.destroy();
          vi.advanceTimersByTime(20000);
        }).not.toThrow();
      } finally {
        vi.useRealTimers();
        // No http.verify(): destroying cancelled the request, which verify()
        // would report as still open. The controller is test-scoped, so
        // nothing leaks into other tests.
      }
    });
  });
});

function clickGenerate(compiled: HTMLElement): void {
  const button = Array.from(compiled.querySelectorAll('button')).find((entry) =>
    entry.textContent?.includes('Generate Ideas'),
  );
  if (!button) {
    throw new Error('Generate Ideas button not found');
  }
  button.click();
}

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
