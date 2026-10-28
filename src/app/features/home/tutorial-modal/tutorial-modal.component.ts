import { Component, HostListener, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

import type { GeneratedIdea } from '../../../services/api.service';
import { formatMinutes as formatMinutesFn } from '../../../shared/format';

@Component({
  selector: 'app-tutorial-modal',
  imports: [LucideAngularModule],
  templateUrl: './tutorial-modal.component.html',
})
export class TutorialModal {
  readonly idea = input.required<GeneratedIdea>();
  readonly closed = output<void>();
  protected readonly formatMinutes = formatMinutesFn;

  protected close(): void {
    this.closed.emit();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }
}
