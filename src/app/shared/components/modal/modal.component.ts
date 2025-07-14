import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ModalService, ModalConfig } from '../../../core/services/modal.service';

@Component({
     selector: 'app-modal',
     standalone: true,
     imports: [CommonModule],
     template: `
    <div *ngIf="currentModal"
         class="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
         (click)="onBackdropClick($event)">
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100"
           (click)="$event.stopPropagation()">

        <div class="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
              <i [class]="currentModal.icon + ' text-base sm:text-lg ' + currentModal.iconClass"></i>
            </div>
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              {{ currentModal.title }}
            </h3>
          </div>
        </div>

        <div class="px-4 sm:px-6 py-3 sm:py-4">
          <p class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ currentModal.message }}
          </p>
        </div>

        <div class="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700">
          <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
            <button *ngIf="currentModal.showCancel"
                    (click)="onCancel()"
                    [class]="'px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base order-2 sm:order-1 ' + (currentModal.cancelButtonClass || 'bg-gray-300 hover:bg-gray-400 text-gray-700')">
              {{ currentModal.cancelText }}
            </button>
            <button (click)="onConfirm()"
                    [class]="'px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base order-1 sm:order-2 ' + (currentModal.confirmButtonClass || 'bg-blue-600 hover:bg-blue-700 text-white')">
              {{ currentModal.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
     styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
    }

    .fixed {
      pointer-events: all;
    }

    @supports (backdrop-filter: blur(8px)) {
      .backdrop-blur-sm {
        backdrop-filter: blur(8px);
      }
    }

    @media (max-width: 640px) {
      .max-w-md {
        max-width: calc(100vw - 2rem);
        margin: 1rem;
      }
    }
  `]
})
export class ModalComponent implements OnInit, OnDestroy {
     private destroy$ = new Subject<void>();
     currentModal: ModalConfig | null = null;

     constructor(private modalService: ModalService) { }

     ngOnInit(): void {
          this.modalService.modals$
               .pipe(takeUntil(this.destroy$))
               .subscribe(modal => {
                    this.currentModal = modal;
               });
     }

     ngOnDestroy(): void {
          this.destroy$.next();
          this.destroy$.complete();
     }

     onConfirm(): void {
          if (this.currentModal) {
               this.modalService.respond(this.currentModal.id, true);
               this.currentModal = null;
          }
     }

     onCancel(): void {
          if (this.currentModal) {
               this.modalService.respond(this.currentModal.id, false);
               this.currentModal = null;
          }
     }

     onBackdropClick(event: Event): void {
          if (event.target === event.currentTarget) {
               this.onCancel();
          }
     }
}
