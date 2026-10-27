import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { APP_INFO } from '../../core/app-info';

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
  imports: [RouterLink, LucideAngularModule],
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
    // Local-only preview: the file is read in the browser and never uploaded anywhere.
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl.set(typeof reader.result === 'string' ? reader.result : null);
      this.fileName.set(file.name);
    };
    reader.readAsDataURL(file);
  }
}
