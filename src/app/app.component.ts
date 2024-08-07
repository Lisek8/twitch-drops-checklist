import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionEvent } from '@angular/service-worker';
import { LS_KEY_SAVED_DROPS } from './components/drops-list/drops-list.component';
import { EMPTY, catchError } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'twitch-drops-checklist';

  constructor(private swUpdate: SwUpdate) {
    this.swUpdate.versionUpdates.pipe(takeUntilDestroyed()).subscribe((versionEvent: VersionEvent) => {
      if (versionEvent.type === 'VERSION_READY') {
        window.location.reload();
      }
    });
  }
}
