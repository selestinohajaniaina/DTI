import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ApiService } from '../../services/api.service';
import type { GeneratedIdea } from '../../services/api.service';
import {
  formatDate as formatDateFn,
  formatMinutes as formatMinutesFn,
  formatPrice as formatPriceFn,
} from '../../shared/format';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-card-generated-idea',
  imports: [LucideAngularModule],
  templateUrl: './card-generated-idea.component.html',
  styleUrl: './card-generated-idea.component.css',
})
export class CardGeneratedIdea {
  @Input() idea!: GeneratedIdea;
  /** Optional library context (source object name, creation date). */
  @Input() sourceName: string | null = null;
  @Input() createdAt: string | null = null;
  @Output() tutorielIdeaEmiter: EventEmitter<GeneratedIdea> = new EventEmitter();

  private readonly api = inject(ApiService);
  protected readonly formatMinutes = formatMinutesFn;
  protected readonly formatPrice = formatPriceFn;

  protected imageSrc(path: string | null): string | null {
    return this.api.imageUrl(path);
  }

  protected sourceLine(): string | null {
    const parts: string[] = [];
    if (this.sourceName) {
      parts.push(`From ${this.sourceName}`);
    }
    if (this.createdAt) {
      parts.push(formatDateFn(this.createdAt));
    }
    return parts.length > 0 ? parts.join(' · ') : null;
  }

  openTutorial(idea: GeneratedIdea) {
    this.tutorielIdeaEmiter.emit(idea);
  }
}
