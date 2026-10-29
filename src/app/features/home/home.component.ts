import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { APP_INFO } from '../../core/app-info';
import { ApiService, type GeneratedIdea, type SourceObjectDto } from '../../services/api.service';
import {
  formatMinutes as formatMinutesFn,
  formatPrice as formatPriceFn,
} from '../../shared/format';
import { TutorialModal } from './tutorial-modal/tutorial-modal.component';

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

@Component({
  selector: 'app-home',
  imports: [RouterLink, LucideAngularModule, TutorialModal],
  templateUrl: './home.component.html',
})
export class Home {
  protected readonly sloganLines = [
    'One photo.',
    'Endless possibilities.',
    'Zero wasted potential.',
  ];
  protected readonly tagline = APP_INFO.tagline;

  protected readonly examples: TransformationExample[] = [
    {
      from: 'Plastic bottle',
      fromIcon: 'recycle',
      to: 'DIY pull-along toy',
      toIcon: 'toy-brick',
      description:
        'A bottle, a string, and a few caps become a rolling toy that keeps kids busy for hours.',
      difficulty: 'Easy',
      time: 'About 1 hour',
      materials: 'Bottle · string · caps',
    },
    {
      from: 'Plastic bottles',
      fromIcon: 'recycle',
      to: 'Vertical garden planter',
      toIcon: 'sprout',
      description:
        'Cut, hang, and fill with soil to grow herbs on a balcony wall or a sunny fence.',
      difficulty: 'Medium',
      time: 'An afternoon',
      materials: 'Bottles · soil · seeds',
    },
    {
      from: 'Cardboard box',
      fromIcon: 'archive',
      to: 'Household organizer',
      toIcon: 'package',
      description:
        'Fold sturdy cardboard into drawer dividers, desk trays, or a cable tidy that looks neat.',
      difficulty: 'Easy',
      time: 'About 1 hour',
      materials: 'Boxes · ruler · glue',
    },
  ];

  protected readonly steps: Step[] = [
    {
      icon: 'camera',
      title: 'Upload an object',
      text: 'Snap a photo of anything you were about to throw away — bottles, boxes, jars, old clothes.',
    },
    {
      icon: 'scan-search',
      title: 'Discover possibilities',
      text: 'DTI will analyze the object and suggest creative, practical ways to give it a second life.',
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
  protected readonly formatMinutes = formatMinutesFn;
  protected readonly formatPrice = formatPriceFn;

  private readonly api = inject(ApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly maxSizeBytes = 10 * 1024 * 1024;

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
    const file = this.selectedFile();
    if (!file || this.isGenerating()) {
      return;
    }
    this.isGenerating.set(true);
    this.generationError.set(null);
    this.api
      .generateIdeas(file)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.isGenerating.set(false);
          this.sourceObject.set(result.sourceObject);
          this.ideas.set(result.ideas);
          this.scrollToResults();
        },
        error: (error: unknown) => {
          this.isGenerating.set(false);
          this.generationError.set(this.toUserMessage(error));
        },
      });
  }

  protected openTutorial(idea: GeneratedIdea): void {
    this.activeTutorial.set(idea);
  }

  protected closeTutorial(): void {
    this.activeTutorial.set(null);
  }

  protected imageSrc(path: string | null): string | null {
    return this.api.imageUrl(path);
  }

  private scrollToResults(): void {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document
      .getElementById('results')
      ?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
  }

  private toUserMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const envelope = error.error as { error?: { message?: unknown } } | null;
      const backendMessage = envelope?.error?.message;
      if (typeof backendMessage === 'string' && backendMessage.length > 0) {
        return backendMessage;
      }
      if (error.status === 0) {
        return 'Cannot reach the DTI server. Is the backend running?';
      }
    }
    return 'Something went wrong while generating ideas. Please try again.';
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
