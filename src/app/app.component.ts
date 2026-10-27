import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './shared/components/footer/footer.component';
import { Navbar } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.component.html',
})
export class App {}
