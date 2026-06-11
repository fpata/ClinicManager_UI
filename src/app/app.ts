import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from "./componets/footer/footer.component";
import { Header } from "./componets/header/header.component";
import { MessagesComponent } from './common/messages/messages.component';
import { LoaderService } from './services/loader.service';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Footer, Header, MessagesComponent, AsyncPipe, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('clinicmanager_UI');

  constructor(public loaderService: LoaderService) {}
}
