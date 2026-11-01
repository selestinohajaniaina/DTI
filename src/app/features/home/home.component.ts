import type { ElementRef } from '@angular/core';
import { Component, DestroyRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription, interval, timer } from 'rxjs';

import { APP_INFO } from '../../core/app-info';
import { ApiService, type GeneratedIdea, type SourceObjectDto } from '../../services/api.service';
import { toUserMessage as toUserMessageFn } from '../../shared/http-errors';
import { TutorialModal } from './tutorial-modal/tutorial-modal.component';
import { CardGeneratedIdea } from '../../components/card-generated-idea/card-generated-idea.component';

interface TransformationExample {
  from: string;
  fromIcon: string;
  to: string;
  toIcon: string;
  description: string;
  difficulty: string;
  time: string;
  materials: string;
}

interface Step {
  icon: string;
  title: string;
  text: string;
}

/** Rotating loading headings (every 2.5 s). Reassuring messages, not progress claims. */
const LOADING_HEADINGS = [
  'Imagining new possibilities…',
  'Giving your object a second life…',
  'Inventing something unexpected…',
  'Exploring creative transformations…',
  'Turning waste into wonder…',
  'Dreaming up clever ideas…',
  'Finding a new purpose for your object…',
  'Putting creativity to work…',
  'Almost ready to reveal your ideas…',
];

/** Rotating loading details (every 3.2 s, independent from the headings). */
const LOADING_DETAILS = [
  'Taking a closer look at your object and what it could become.',
  'Exploring creative ways to reuse what you already have.',
  'Thinking through practical transformations for your everyday life.',
  'Finding possibilities in materials that might otherwise go to waste.',
  'Preparing ideas to help you turn imagination into something useful.',
  'Estimating the potential value of your upcycled creation.',
  'Putting the finishing touches on your ideas.',
];

const LOADING_HEADING_INTERVAL_MS = 2500;
const LOADING_DETAIL_INTERVAL_MS = 3700;
/** How long an outgoing message stays mounted while it fades out. */
const LOADING_HEADING_EXIT_MS = 220;
const LOADING_DETAIL_EXIT_MS = 200;

@Component({
  selector: 'app-home',
  imports: [RouterLink, LucideAngularModule, TutorialModal, CardGeneratedIdea],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class Home {
  private resultsSection = viewChild<ElementRef<HTMLElement>>('resultsSection');

  protected readonly sloganLines = [
    'One photo.',
    'Endless possibilities.',
    'Zero wasted potential.',
  ];
  protected readonly tagline = APP_INFO.tagline;

  protected readonly steps: Step[] = [
    {
      icon: 'camera',
      title: 'Upload an object',
      text: 'Snap a photo of anything you were about to throw away — bottles, boxes, jars, old clothes.',
    },
    {
      icon: 'scan-search',
      title: 'Discover possibilities',
      text: 'DTI analyzes the object and suggests creative, practical ways to give it a second life.',
    },
    {
      icon: 'hammer',
      title: 'Create something useful',
      text: 'Follow clear step-by-step guides and turn would-be waste into toys, decor, and tools.',
    },
  ];

  protected readonly previewUrl = signal<string | null>(null);
  protected readonly fileName = signal<string | null>(null);
  protected readonly isDragging = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly isGenerating = signal(false);
  protected readonly generationError = signal<string | null>(null);
  protected readonly ideas = signal<GeneratedIdea[] | null>(null);
  protected readonly sourceObject = signal<SourceObjectDto | null>(null);
  protected readonly activeTutorial = signal<GeneratedIdea | null>(null);
  protected readonly loadingHeadingIndex = signal(0);
  protected readonly loadingDetailIndex = signal(0);
  protected readonly loadingHeading = computed(
    () => LOADING_HEADINGS[this.loadingHeadingIndex()] ?? 'Imagining new possibilities…',
  );
  protected readonly loadingDetail = computed(
    () =>
      LOADING_DETAILS[this.loadingDetailIndex()] ??
      'Taking a closer look at your object and what it could become.',
  );
  /** Outgoing messages, kept mounted briefly so they can fade out. */
  protected readonly exitingHeading = signal<string | null>(null);
  protected readonly exitingDetail = signal<string | null>(null);

  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly maxSizeBytes = 10 * 1024 * 1024;
  private loadingMessagesSub: Subscription | null = null;

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFiles(input.files);
    input.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    this.handleFiles(event.dataTransfer?.files ?? null);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  protected clearPreview(): void {
    this.previewUrl.set(null);
    this.fileName.set(null);
    this.errorMessage.set(null);
    this.selectedFile.set(null);
    this.generationError.set(null);
    this.ideas.set(null);
    this.sourceObject.set(null);
    this.activeTutorial.set(null);
  }

  protected generateIdeas(): void {
    this.scrollToResults();
    const file = this.selectedFile();
    if (!file || this.isGenerating()) {
      return;
    }
    this.isGenerating.set(true);
    this.generationError.set(null);
    this.startLoadingMessages();
    this.api
      .generateIdeas(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isGenerating.set(false);
          this.stopLoadingMessages();
          this.sourceObject.set(result.sourceObject);
          this.ideas.set(result.ideas);
          this.scrollToResults();
        },
        error: (error: unknown) => {
          this.isGenerating.set(false);
          this.stopLoadingMessages();
          this.generationError.set(
            toUserMessageFn(error, {
              unreachable: 'Cannot reach the DTI server. Is the backend running?',
              generic: 'Something went wrong while generating ideas. Please try again.',
            }),
          );
        },
      });
  }

  /**
   * Rotates the loading heading and detail on independent timers for the
   * whole request. Always restarts from the first message and replaces any
   * previous loop, so repeated generations can never stack timers.
   */
  private startLoadingMessages(): void {
    this.stopLoadingMessages();
    this.loadingHeadingIndex.set(0);
    this.loadingDetailIndex.set(0);
    this.exitingHeading.set(null);
    this.exitingDetail.set(null);
    const messages = new Subscription();
    messages.add(
      interval(LOADING_HEADING_INTERVAL_MS)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.rotateHeading()),
    );
    messages.add(
      interval(LOADING_DETAIL_INTERVAL_MS)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.rotateDetail()),
    );
    this.loadingMessagesSub = messages;
  }

  /** Snapshots the outgoing heading, advances, then unmounts it after its exit. */
  private rotateHeading(): void {
    const snapshot = this.loadingHeading();
    this.exitingHeading.set(snapshot);
    this.loadingHeadingIndex.update((index) => (index + 1) % LOADING_HEADINGS.length);
    this.loadingMessagesSub?.add(
      timer(LOADING_HEADING_EXIT_MS)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.exitingHeading() === snapshot) {
            this.exitingHeading.set(null);
          }
        }),
    );
  }

  private rotateDetail(): void {
    const snapshot = this.loadingDetail();
    this.exitingDetail.set(snapshot);
    this.loadingDetailIndex.update((index) => (index + 1) % LOADING_DETAILS.length);
    this.loadingMessagesSub?.add(
      timer(LOADING_DETAIL_EXIT_MS)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.exitingDetail() === snapshot) {
            this.exitingDetail.set(null);
          }
        }),
    );
  }

  private stopLoadingMessages(): void {
    this.loadingMessagesSub?.unsubscribe();
    this.loadingMessagesSub = null;
  }

  protected openTutorial(idea: GeneratedIdea): void {
    this.activeTutorial.set(idea);
  }

  protected closeTutorial(): void {
    this.activeTutorial.set(null);
  }

  private scrollToResults(): void {
    setTimeout(() => {
      this.resultsSection()?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  private handleFiles(files: FileList | null): void {
    const file = files?.item(0);
    if (!file) {
      return;
    }
    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please choose an image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > this.maxSizeBytes) {
      this.errorMessage.set('That photo is larger than 10 MB. Please pick a smaller one.');
      return;
    }
    this.errorMessage.set(null);
    this.generationError.set(null);
    this.ideas.set(null);
    this.sourceObject.set(null);
    this.activeTutorial.set(null);
    // Preview locally; the file is uploaded only when ideas are generated.
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(typeof reader.result === 'string' ? reader.result : null);
      this.fileName.set(file.name);
    };
    reader.readAsDataURL(file);
  }
}
