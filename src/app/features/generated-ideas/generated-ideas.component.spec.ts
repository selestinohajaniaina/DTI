import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { importProvidersFrom } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { vi } from 'vitest';

import { APP_ICONS } from '../../shared/icons';
import type { LibraryIdea, LibraryPage, SourceObjectSummary } from '../../services/api.service';
import { GeneratedIdeas } from './generated-ideas.component';

const IDEAS_URL = 'http://127.0.0.1:3000/api/ai/ideas';
const SOURCES_URL = 'http://127.0.0.1:3000/api/ai/source-objects';

function makeIdea(overrides: Partial<LibraryIdea> = {}): LibraryIdea {
  return {
    id: 'idea-uuid-1',
    title: 'Mini Vase',
    description: 'A colorful second life.',
    intendedUse: 'Decoration',
    difficulty: 'Easy',
    estimatedMinutes: 15,
    image: { url: '/uploads/generated/vase.png', status: 'completed' },
    marketPrice: {
      status: 'estimated',
      currency: 'USD',
      estimatedCost: 2.5,
      estimatedSellingPrice: 8,
    },
    tutorial: {
      materials: ['Cup'],
      tools: ['Brush'],
      steps: [{ step: 1, title: 'Paint', description: 'Paint it' }],
      safetyNotes: [],
    },
    sourceObject: {
      id: 'source-uuid-1',
      name: 'Cup',
      material: 'plastic',
      condition: 'reusable',
      imageUrl: '/uploads/source/cup.png',
    },
    createdAt: '2026-03-04T00:00:00.000Z',
    ...overrides,
  };
}

function makePage(
  items: LibraryIdea[],
  total: number = items.length,
  page = 1,
  limit = 12,
): LibraryPage {
  return {
    items,
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

const SOURCES: SourceObjectSummary[] = [
  { id: 'source-uuid-1', name: 'Cup', imageUrl: null, createdAt: '2026-03-04T00:00:00.000Z' },
  { id: 'source-uuid-2', name: 'Bottle', imageUrl: null, createdAt: '2026-03-05T00:00:00.000Z' },
];

describe('GeneratedIdeas', () => {
  let fixture: ComponentFixture<GeneratedIdeas>;
  let http: HttpTestingController;

  function expectIdeas() {
    return http.expectOne((request) => request.url === IDEAS_URL);
  }

  function flushInitial(page: LibraryPage, sources: SourceObjectSummary[] = SOURCES): void {
    expectIdeas().flush({ success: true, data: page });
    http.expectOne(SOURCES_URL).flush({ success: true, data: { items: sources } });
    fixture.detectChanges();
  }

  function compiled(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function setSelect(selector: string, value: string): void {
    const select = compiled().querySelector(selector) as HTMLSelectElement | null;
    if (!select) {
      throw new Error(`select ${selector} not found`);
    }
    select.value = value;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [GeneratedIdeas],
      providers: [
        provideRouter([]),
        importProvidersFrom(LucideAngularModule.pick(APP_ICONS)),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
    Object.defineProperty(window, 'matchMedia', {
      value: () => ({ matches: false }) as MediaQueryList,
      configurable: true,
      writable: true,
    });
    Element.prototype.scrollIntoView = () => undefined;
  });

  afterEach(() => {
    localStorage.clear();
    http.verify();
  });

  it('renders the title and loads ideas into cards', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    expect(compiled().querySelector('h1')?.textContent).toContain('Generated Ideas');
    flushInitial(makePage([makeIdea(), makeIdea({ id: 'idea-uuid-2', title: 'Planter' })]));

    const cards = compiled().querySelectorAll('app-card-generated-idea');
    expect(cards.length).toBe(2);
    expect(compiled().textContent).toContain('2 ideas');
  });

  it('shows skeleton cards while loading', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();

    const status = compiled().querySelector('[role="status"]');
    expect(status?.textContent).toContain('Loading ideas');
    expect(status?.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);

    flushInitial(makePage([]));
  });

  it('shows the first-use empty state with a generation link', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    flushInitial(makePage([]));

    expect(compiled().textContent).toContain('No generated ideas yet.');
    const cta = Array.from(compiled().querySelectorAll('a')).find((entry) =>
      entry.textContent?.includes('Generate ideas'),
    );
    expect(cta?.getAttribute('href')).toBe('/#upload');
  });

  it('debounces search, resets the page, and clears from the button', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    flushInitial(makePage([makeIdea()]));
    vi.useFakeTimers();
    try {
      const input = compiled().querySelector('#library-search') as HTMLInputElement;
      input.value = 'vase';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      vi.advanceTimersByTime(299);
      expect(() => expectIdeas()).toThrow();

      vi.advanceTimersByTime(1);
      const req = expectIdeas();
      expect(req.request.params.get('q')).toBe('vase');
      expect(req.request.params.get('page')).toBe('1');
      req.flush({ success: true, data: makePage([]) });
      fixture.detectChanges();
      expect(compiled().textContent).toContain('No ideas match your search.');

      const clear = compiled().querySelector(
        'button[aria-label="Clear search"]',
      ) as HTMLButtonElement;
      clear.click();
      fixture.detectChanges();
      const cleared = expectIdeas();
      expect(cleared.request.params.has('q')).toBe(false);
      cleared.flush({ success: true, data: makePage([makeIdea()]) });
      fixture.detectChanges();
      expect(compiled().querySelector('app-card-generated-idea')).not.toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it('filters, sorts and resets criteria together', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    flushInitial(makePage([makeIdea()], 25));

    setSelect('#library-difficulty', 'Hard');
    let req = expectIdeas();
    expect(req.request.params.get('difficulty')).toBe('Hard');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ success: true, data: makePage([]) });
    fixture.detectChanges();

    setSelect('#library-sort', 'title');
    req = expectIdeas();
    expect(req.request.params.get('sort')).toBe('title');
    expect(req.request.params.get('difficulty')).toBe('Hard');
    req.flush({ success: true, data: makePage([]) });
    fixture.detectChanges();

    setSelect('#library-source', 'source-uuid-2');
    req = expectIdeas();
    expect(req.request.params.get('sourceObjectId')).toBe('source-uuid-2');
    req.flush({ success: true, data: makePage([]) });
    fixture.detectChanges();

    const reset = Array.from(compiled().querySelectorAll('button')).find((entry) =>
      entry.textContent?.includes('Reset filters'),
    );
    reset?.click();
    fixture.detectChanges();
    req = expectIdeas();
    expect(req.request.params.get('sort')).toBe('newest');
    expect(req.request.params.has('difficulty')).toBe(false);
    expect(req.request.params.has('sourceObjectId')).toBe(false);
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ success: true, data: makePage([makeIdea()]) });
    fixture.detectChanges();
  });

  it('paginates while preserving criteria and disabling bounds', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    flushInitial(makePage([makeIdea()], 25));

    const nav = () => compiled().querySelector('nav[aria-label="Library pages"]');
    expect(nav()?.textContent).toContain('Page 1 of 3');
    const [prev, next] = Array.from(nav()?.querySelectorAll('button') ?? []);
    expect((prev as HTMLButtonElement).disabled).toBe(true);
    expect((next as HTMLButtonElement).disabled).toBe(false);

    (next as HTMLButtonElement).click();
    fixture.detectChanges();
    const page2 = expectIdeas();
    expect(page2.request.params.get('page')).toBe('2');
    page2.flush({
      success: true,
      data: makePage([makeIdea({ id: 'idea-uuid-2', title: 'Planter' })], 25, 2),
    });
    fixture.detectChanges();
    expect(nav()?.textContent).toContain('Page 2 of 3');
  });

  it('ignores stale responses when requests overlap', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    flushInitial(makePage([makeIdea()], 25));

    setSelect('#library-sort', 'title');
    setSelect('#library-sort', 'oldest');
    const [first, second] = http.match((request) => request.url === IDEAS_URL);
    if (!first || !second) {
      throw new Error('expected two outstanding ideas requests');
    }
    second.flush({
      success: true,
      data: makePage([makeIdea({ id: 'idea-b', title: 'Second' })], 25),
    });
    fixture.detectChanges();
    first.flush({
      success: true,
      data: makePage([makeIdea({ id: 'idea-a', title: 'First' })], 25),
    });
    fixture.detectChanges();

    expect(compiled().textContent).toContain('Second');
    expect(compiled().textContent).not.toContain('First');
  });

  it('shows an error with retry instead of fake data', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    expectIdeas().flush(
      { success: false, error: { code: 'AI_UPSTREAM_ERROR', message: 'Meta AI failed' } },
      { status: 502, statusText: 'Bad Gateway' },
    );
    http.expectOne(SOURCES_URL).flush({ success: true, data: { items: [] } });
    fixture.detectChanges();

    expect(compiled().querySelector('[role="alert"]')?.textContent).toContain('Meta AI failed');
    const retry = Array.from(compiled().querySelectorAll('button')).find((entry) =>
      entry.textContent?.includes('Try again'),
    );
    retry?.click();
    fixture.detectChanges();
    expectIdeas().flush({ success: true, data: makePage([makeIdea()]) });
    fixture.detectChanges();
    expect(compiled().querySelector('app-card-generated-idea')).not.toBeNull();
  });

  it('opens the tutorial modal from a card and closes it', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    flushInitial(makePage([makeIdea()]));

    const view = Array.from(compiled().querySelectorAll('button')).find((entry) =>
      entry.textContent?.includes('View Tutorial'),
    );
    view?.click();
    fixture.detectChanges();
    expect(compiled().querySelector('app-tutorial-modal')).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(compiled().querySelector('app-tutorial-modal')).toBeNull();
  });

  it('renders fallbacks for missing images and prices', () => {
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();
    flushInitial(
      makePage([
        makeIdea({
          image: { url: null, status: 'failed' },
          marketPrice: {
            status: 'estimated',
            currency: 'USD',
            estimatedCost: null,
            estimatedSellingPrice: null,
          },
        }),
      ]),
    );

    expect(compiled().textContent).toContain('Illustration unavailable');
    expect(compiled().textContent).toContain('Not available');
  });

  it('sends the stored anonymous owner id', () => {
    localStorage.setItem('dti.anonymousOwnerId', 'anon-uuid-1');
    fixture = TestBed.createComponent(GeneratedIdeas);
    fixture.detectChanges();

    const req = expectIdeas();
    expect(req.request.headers.get('x-anonymous-owner-id')).toBe('anon-uuid-1');
    req.flush({ success: true, data: makePage([]) });
    http.expectOne(SOURCES_URL).flush({ success: true, data: { items: [] } });
    fixture.detectChanges();
  });
});
