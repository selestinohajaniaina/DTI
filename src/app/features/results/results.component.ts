import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Empty state shown when the user opens /results before generating ideas.
 * Points to the home upload instead of showing fake AI results.
 */
@Component({
  selector: 'app-results',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './results.component.html',
})
export class Results {
  protected readonly included = [
    {
      icon: 'scan-search',
      title: 'Ideas matched to your photo',
      text: 'Several reuse suggestions based on the object and materials DTI detects.',
    },
    {
      icon: 'puzzle',
      title: 'Difficulty, time & materials',
      text: 'Every idea labeled so you can pick a project that fits your day.',
    },
    {
      icon: 'hammer',
      title: 'Step-by-step guides',
      text: 'Clear instructions that take you from raw object to finished creation.',
    },
  ];
}
