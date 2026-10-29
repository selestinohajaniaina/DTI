import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

interface DetailedStep {
  icon: string;
  title: string;
  text: string;
  points: string[];
}

@Component({
  selector: 'app-how-it-works',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './how-it-works.component.html',
})
export class HowItWorks {
  protected readonly steps: DetailedStep[] = [
    {
      icon: 'camera',
      title: 'Upload an object',
      text: 'Take a photo of anything you were about to discard. One clear picture is all DTI needs to get started.',
      points: [
        'Works with bottles, boxes, jars, textiles, and more',
        'No account or setup required',
        'Your photo is analyzed to spot materials and reuse potential',
      ],
    },
    {
      icon: 'scan-search',
      title: 'Discover possibilities',
      text: 'DTI recognizes the object and its materials, then suggests several creative reuse ideas matched to what you have.',
      points: [
        'Multiple ideas per object, from quick wins to weekend projects',
        'Each idea shows difficulty, time, and needed materials',
        'Ideas span toys, decor, household items, and tools',
      ],
    },
    {
      icon: 'hammer',
      title: 'Create something useful',
      text: 'Pick an idea and follow a clear step-by-step guide — with tips on tools, safety, and finishing touches — until your old object has a brand-new job.',
      points: [
        'Beginner-friendly instructions',
        'Built around tools most homes already have',
        'Designed to be genuinely useful, not just decorative',
      ],
    },
  ];
}
