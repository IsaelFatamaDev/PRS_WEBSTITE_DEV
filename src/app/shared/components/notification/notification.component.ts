import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, NotificationData } from '../../../core/services/notification.service';

@Component({
     selector: 'app-notification',
     standalone: true,
     imports: [CommonModule],
     template: `
    <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      <div
        *ngFor="let notification of notifications; trackBy: trackByNotification"
        class="transform transition-all duration-500 ease-in-out"
        [class.translate-x-0]="true"
        [class.opacity-100]="true">

        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 p-4 relative overflow-hidden"
          [class.border-green-500]="notification.type === 'success'"
          [class.border-red-500]="notification.type === 'error'"
          [class.border-yellow-500]="notification.type === 'warning'"
          [class.border-blue-500]="notification.type === 'info'">

          <div
            *ngIf="notification.showProgress"
            class="absolute bottom-0 left-0 h-1 transition-all duration-100 ease-linear"
            [class.bg-green-500]="notification.type === 'success'"
            [class.bg-red-500]="notification.type === 'error'"
            [class.bg-yellow-500]="notification.type === 'warning'"
            [class.bg-blue-500]="notification.type === 'info'"
            [style.width.%]="getProgressWidth(notification.id)">
          </div>

          <div class="flex items-start gap-3">
            <div
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              [class.bg-green-100]="notification.type === 'success'"
              [class.text-green-600]="notification.type === 'success'"
              [class.bg-red-100]="notification.type === 'error'"
              [class.text-red-600]="notification.type === 'error'"
              [class.bg-yellow-100]="notification.type === 'warning'"
              [class.text-yellow-600]="notification.type === 'warning'"
              [class.bg-blue-100]="notification.type === 'info'"
              [class.text-blue-600]="notification.type === 'info'">

              <i class="fas fa-check text-sm" *ngIf="notification.type === 'success'"></i>
              <i class="fas fa-times text-sm" *ngIf="notification.type === 'error'"></i>
              <i class="fas fa-exclamation-triangle text-sm" *ngIf="notification.type === 'warning'"></i>
              <i class="fas fa-info text-sm" *ngIf="notification.type === 'info'"></i>
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {{ notification.title }}
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ notification.message }}
              </p>
            </div>

            <button
              (click)="removeNotification(notification.id)"
              class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
     styles: [`
    :host {
      pointer-events: none;
    }

    :host > div {
      pointer-events: auto;
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();
     notifications: NotificationData[] = [];
     private timers = new Map<string, any>();
     private progressIntervals = new Map<string, any>();
     private progressValues = new Map<string, number>();

     constructor(private notificationService: NotificationService) { }

     ngOnInit(): void {
          this.notificationService.notifications$
               .pipe(takeUntil(this.destroy$))
               .subscribe(notification => this.addNotification(notification));
     }

     ngOnDestroy(): void {
          this.destroy$.next();
          this.destroy$.complete();
          this.clearAllTimers();
     }

     trackByNotification(index: number, notification: NotificationData): string {
          return notification.id;
     }

     private addNotification(notification: NotificationData): void {
          this.notifications.push(notification);

          if (notification.duration && notification.duration > 0) {
               this.startProgress(notification);

               const timer = setTimeout(() => {
                    this.removeNotification(notification.id);
               }, notification.duration);

               this.timers.set(notification.id, timer);
          }
     }

     removeNotification(id: string): void {
          const index = this.notifications.findIndex(n => n.id === id);
          if (index > -1) {
               this.notifications.splice(index, 1);
          }

          if (this.timers.has(id)) {
               clearTimeout(this.timers.get(id));
               this.timers.delete(id);
          }

          if (this.progressIntervals.has(id)) {
               clearInterval(this.progressIntervals.get(id));
               this.progressIntervals.delete(id);
          }

          this.progressValues.delete(id);
     }

     private startProgress(notification: NotificationData): void {
          if (!notification.duration || !notification.showProgress) return;

          this.progressValues.set(notification.id, 100);
          const stepTime = 50;
          const stepDecrement = (100 * stepTime) / notification.duration;

          const interval = setInterval(() => {
               const currentProgress = this.progressValues.get(notification.id) || 0;
               const newProgress = Math.max(0, currentProgress - stepDecrement);
               this.progressValues.set(notification.id, newProgress);

               if (newProgress <= 0) {
                    clearInterval(interval);
                    this.progressIntervals.delete(notification.id);
               }
          }, stepTime);

          this.progressIntervals.set(notification.id, interval);
     }

     getProgressWidth(id: string): number {
          return this.progressValues.get(id) || 0;
     }

     private clearAllTimers(): void {
          this.timers.forEach(timer => clearTimeout(timer));
          this.progressIntervals.forEach(interval => clearInterval(interval));
          this.timers.clear();
          this.progressIntervals.clear();
          this.progressValues.clear();
     }
}
