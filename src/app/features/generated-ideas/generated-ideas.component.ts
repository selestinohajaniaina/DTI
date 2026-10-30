import { Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import type { ElementRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { CardGeneratedIdea } from '../../components/card-generated-idea/card-generated-idea.component';
import { toUserMessage as toUserMessageFn } from '../../shared/http-errors';
import {
  ApiService,
  type GeneratedIdea,
  type LibraryIdea,
  type SourceObjectSummary,
} from '../../services/api.service';
import { TutorialModal } from '../home/tutorial-modal/tutorial-modal.component';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE_OPTIONS = [12, 24, 48];
const DEFAULT_PAGE_SIZE = 12;

type SortKey = 'newest' | 'oldest' | 'title' | 'priceDesc' | 'priceAsc';
type PriceFilter = 'all' | 'with' | 'without';

interface SortOption {
  value: SortKey;
  label: string;
}

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'title', label: 'Title A–Z' },
  { value: 'priceDesc', label: 'Price: high to low' },
  { value: 'priceAsc', label: 'Price: low to high' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

@Component({
  selector: 'app-generated-ideas',
  imports: [RouterLink, LucideAngularModule, CardGeneratedIdea, TutorialModal],
  templateUrl: './generated-ideas.component.html',
})
export class GeneratedIdeas implements OnInit {
  private resultsTop = viewChild<ElementRef<HTMLElement>>('resultsTop');

  protected readonly ideas = signal<LibraryIdea[]>([]);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly page = signal(1);
  protected readonly limit = signal(DEFAULT_PAGE_SIZE);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly searchInput = signal('');
  protected readonly activeTutorial = signal<GeneratedIdea | null>(null);
  protected readonly sourceObjects = signal<SourceObjectSummary[]>([]);

  protected readonly search = signal('');
  protected readonly difficulty = signal('');
  protected readonly sourceObjectId = signal('');
  protected readonly priceFilter = signal<PriceFilter>('all');
  protected readonly sort = signal<SortKey>('newest');

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly difficulties = DIFFICULTIES;
  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;
  protected readonly skeletonSlots = computed(() =>
    Array.from({ length: this.limit() }, (_, index) => index),
  );

  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTerms = new Subject<string>();
  private fetchSeq = 0;

  ngOnInit(): void {
    this.searchTerms
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
        if (term === this.search()) {
          return;
        }
        this.search.set(term);
        this.page.set(1);
        this.fetchIdeas();
      });
    this.fetchIdeas();
    this.api
      .listSourceObjects()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (items) => this.sourceObjects.set(items),
        error: () => this.sourceObjects.set([]),
      });
  }

  protected onSearchInput(value: string): void {
    this.searchInput.set(value);
    this.searchTerms.next(value.trim());
  }

  protected clearSearch(): void {
    this.searchInput.set('');
    this.search.set('');
    this.searchTerms.next('');
    this.page.set(1);
    this.fetchIdeas();
  }

  protected onDifficultyChange(value: string): void {
    this.difficulty.set(value);
    this.page.set(1);
    this.fetchIdeas();
  }

  protected onSourceChange(value: string): void {
    this.sourceObjectId.set(value);
    this.page.set(1);
    this.fetchIdeas();
  }

  protected onPriceFilterChange(value: string): void {
    this.priceFilter.set(value === 'with' || value === 'without' ? value : 'all');
    this.page.set(1);
    this.fetchIdeas();
  }

  protected onSortChange(value: string): void {
    const option = SORT_OPTIONS.find((entry) => entry.value === value);
    this.sort.set(option?.value ?? 'newest');
    this.page.set(1);
    this.fetchIdeas();
  }

  protected onLimitChange(value: string): void {
    const parsed = Number.parseInt(value, 10);
    this.limit.set(PAGE_SIZE_OPTIONS.includes(parsed) ? parsed : DEFAULT_PAGE_SIZE);
    this.page.set(1);
    this.fetchIdeas();
  }

  protected resetFilters(): void {
    this.searchInput.set('');
    this.searchTerms.next('');
    this.search.set('');
    this.difficulty.set('');
    this.sourceObjectId.set('');
    this.priceFilter.set('all');
    this.sort.set('newest');
    this.page.set(1);
    this.fetchIdeas();
  }

  protected goToPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), Math.max(1, this.totalPages()));
    if (clamped === this.page()) {
      return;
    }
    this.page.set(clamped);
    this.fetchIdeas();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.resultsTop()?.nativeElement.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  }

  protected retry(): void {
    this.fetchIdeas();
  }

  protected openTutorial(idea: GeneratedIdea): void {
    this.activeTutorial.set(idea);
  }

  protected closeTutorial(): void {
    this.activeTutorial.set(null);
  }

  protected hasActiveCriteria(): boolean {
    return (
      this.search() !== '' ||
      this.difficulty() !== '' ||
      this.sourceObjectId() !== '' ||
      this.priceFilter() !== 'all'
    );
  }

  private fetchIdeas(): void {
    const seq = ++this.fetchSeq;
    this.loading.set(true);
    this.error.set(null);
    const price = this.priceFilter();
    this.api
      .listIdeas({
        q: this.search() === '' ? undefined : this.search(),
        sourceObjectId: this.sourceObjectId() === '' ? undefined : this.sourceObjectId(),
        difficulty: this.difficulty() === '' ? undefined : this.difficulty(),
        hasPrice: price === 'all' ? undefined : price === 'with',
        sort: this.sort(),
        page: this.page(),
        limit: this.limit(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          if (seq !== this.fetchSeq) {
            return;
          }
          this.loading.set(false);
          this.ideas.set(result.items);
          this.total.set(result.total);
          this.totalPages.set(result.totalPages);
          this.page.set(result.page);
        },
        error: (error: unknown) => {
          if (seq !== this.fetchSeq) {
            return;
          }
          this.loading.set(false);
          this.error.set(
            toUserMessageFn(error, {
              unreachable: 'Cannot reach the DTI server. Check your connection and try again.',
              generic: 'Something went wrong while loading your ideas. Please try again.',
            }),
          );
        },
      });
  }
}
