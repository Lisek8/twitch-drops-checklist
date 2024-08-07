import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import dropsData from '@drops-data';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { Drop, Stream } from '@models/models';
import { TwitchApiProviderService } from '@providers/twitch-api-provider/twitch-api-provider.service';

export const LS_KEY_SAVED_DROPS = 'TDC_Drops';
const LS_KEY_TWITCH_AUTH = 'TDC_Twitch_Auth';
const TWITCH_REDIRECT = `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=8cb1honglwfpwmo13luwfkxqx8ba4h&redirect_uri=${document.baseURI.endsWith('/') ? document.baseURI.slice(0, -1) : document.baseURI}/&scope=`;

interface DropFormGroup {
  [key: string]: FormControl<boolean | null>;
}

@Component({
  selector: 'app-drops-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './drops-list.component.html',
  styleUrl: './drops-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropsListComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  private twitchAuth!: string;

  genericDrops: Drop[];
  streamerDrops: Drop[];
  dropsForm!: ReturnType<DropsListComponent['createForm']>;
  onlineStreamers: string[] = [];

  constructor(private twitchApiProviderService: TwitchApiProviderService, private cdr: ChangeDetectorRef) {
    this.genericDrops = dropsData.generic;
    this.streamerDrops = dropsData.stream;
  }

  ngOnInit(): void {
    this.handleTwitchAuth();

    this.dropsForm = this.createForm();
    this.loadClaimedDrops();

    if (this.twitchAuth) {
      this.getTwitchOnlineStatus();
    }

    this.dropsForm.valueChanges.pipe(
      debounceTime(500),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.saveClaimedDrops();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private handleTwitchAuth() {
    const twitchAccessToken = new URLSearchParams(window.location.hash.substring(1)).get('access_token');

    if (twitchAccessToken) {
      this.twitchAuth = twitchAccessToken;
      this.saveTwitchAuthToken(twitchAccessToken);
    } else {
      this.loadTwitchAuthToken();
    }
  }

  private createForm() {
    const formGroup = new FormGroup<DropFormGroup>({});

    this.genericDrops.forEach((dropData) => {
      formGroup.addControl(dropData.id.toString(), new FormControl<boolean>(false));
    });

    this.streamerDrops.forEach((dropData) => {
      formGroup.addControl(dropData.id.toString(), new FormControl<boolean>(false));
    });

    return formGroup;
  }

  private loadClaimedDrops(): void {
    try {
      const claimedDrops = JSON.parse(localStorage.getItem(LS_KEY_SAVED_DROPS) ?? '') as number[];

      if (claimedDrops) {
        claimedDrops.forEach((dropId) => {
          this.dropsForm.get(dropId.toString())?.setValue(true);
        })
      }
    } catch (_) {
      // Soft fail loading
    }
  }

  private saveClaimedDrops(): void {
    const claimedDrops: number[] = [];

    try {
      const formValue = this.dropsForm.getRawValue();
      Object.keys(formValue).forEach((dropId) => {
        if (formValue[dropId]) {
          claimedDrops.push(+dropId);
        }
      });

      localStorage.setItem(LS_KEY_SAVED_DROPS, JSON.stringify(claimedDrops));
    } catch (error) {
      console.error('An error occured while trying to save drops');
    }
  }

  private loadTwitchAuthToken(): void {
    this.twitchAuth = localStorage.getItem(LS_KEY_TWITCH_AUTH) ?? '';
  }

  private saveTwitchAuthToken(twitchAuth: string): void {
    localStorage.setItem(LS_KEY_TWITCH_AUTH, twitchAuth);
  }

  private getTwitchOnlineStatus(): void {
    const userNames: string[] = [];

    this.streamerDrops.forEach((drop: Drop) => {
      drop.streams?.forEach((stream: Stream) => userNames.push(stream.name));
    });

    this.twitchApiProviderService.getTwitchOnlineStatus(userNames, this.twitchAuth).pipe(
      takeUntil(this.destroy$)
    ).subscribe((onlineStreamers: string[]) => {
      this.onlineStreamers = onlineStreamers;
      this.cdr.markForCheck();
    });
  }

  isStreamOnline(streamName: string): boolean {
    streamName = streamName.toLowerCase();

    return !!this.onlineStreamers.find((name) => name.toLowerCase() === streamName);
  }

  authTwitch(): void {
    window.location.href = TWITCH_REDIRECT;
  }

  clearDropsData(): void {
    localStorage.removeItem(LS_KEY_SAVED_DROPS);
    this.dropsForm.reset();
  }
}
