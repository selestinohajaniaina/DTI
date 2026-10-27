import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

import { APP_INFO } from '../../../core/app-info';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './footer.component.html',
})
export class Footer {
  protected readonly appName = APP_INFO.name;
  protected readonly appFullName = APP_INFO.fullName;
  protected readonly tagline = APP_INFO.tagline;
  protected readonly year = new Date().getFullYear();
}
