import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { ApiService, GeneratedIdea } from '../../services/api.service';
import {
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
  @Output() tutorielIdeaEmiter: EventEmitter<GeneratedIdea> = new EventEmitter();

  private readonly api = inject(ApiService);
  protected readonly formatMinutes = formatMinutesFn;
  protected readonly formatPrice = formatPriceFn;

  protected imageSrc(path: string | null): string | null {
    return this.api.imageUrl(path);
  }

  openTutorial(idea: GeneratedIdea) {
    this.tutorielIdeaEmiter.emit(idea);
  }
}
