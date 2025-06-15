import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-goodbye-animation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-[9999] flex items-center justify-center"
      [style.background]="'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)'"
      [@fadeInOut]="animationState"
      (@fadeInOut.done)="onAnimationDone($event)">

      <!-- Main Content -->
      <div class="text-center">
        <!-- Logo Animation -->
        <div
          class="mb-8"
          [@logoAnimation]="animationState">
          <div class="relative mx-auto w-32 h-32 mb-6">
            <div class="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
            <div class="relative w-full h-full bg-white rounded-full shadow-2xl flex items-center justify-center">
              <img
                src="assets/images/Gotita.png"
                alt="Sistema JASS"
                class="w-20 h-20 object-contain filter drop-shadow-lg">
            </div>
          </div>
        </div>

        <!-- Goodbye Text -->
        <div [@textAnimation]="animationState">
          <h1 class="text-5xl font-bold text-white mb-4 tracking-wide">
            ¡Hasta Luego!
          </h1>
          <h2 class="text-2xl text-red-100 mb-8 font-light">
            Gracias por usar Sistema JASS
          </h2>

          <!-- Loading dots -->
          <div class="flex justify-center space-x-2">
            <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 150ms"></div>
            <div class="w-3 h-3 bg-white rounded-full animate-bounce" style="animation-delay: 300ms"></div>
          </div>
        </div>
      </div>

      <!-- Floating particles -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-float-slow"></div>
        <div class="absolute top-1/3 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-float-fast"></div>
        <div class="absolute bottom-1/4 left-1/3 w-3 h-3 bg-white/20 rounded-full animate-float-medium"></div>
        <div class="absolute bottom-1/3 right-1/3 w-1.5 h-1.5 bg-white/35 rounded-full animate-float-slow"></div>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('800ms ease-out', style({
          opacity: 0,
          transform: 'scale(0.8)'
        }))
      ])
    ]),
    trigger('logoAnimation', [
      state('in', style({ transform: 'scale(1) rotate(0deg)' })),
      transition(':enter', [
        style({ transform: 'scale(1.2) rotate(0deg)' }),
        animate('1000ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          style({ transform: 'scale(1) rotate(360deg)' }))
      ])
    ]),
    trigger('textAnimation', [
      state('in', style({ transform: 'translateY(0px)', opacity: 1 })),
      transition(':enter', [
        style({ transform: 'translateY(-30px)', opacity: 0 }),
        animate('800ms 600ms ease-out',
          style({ transform: 'translateY(0px)', opacity: 1 }))
      ])
    ])
  ],
  styles: [`
    @keyframes float-slow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(-180deg); }
    }
    @keyframes float-medium {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-15px) rotate(-90deg); }
    }
    @keyframes float-fast {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-10px) rotate(-360deg); }
    }
    .animate-float-slow { animation: float-slow 4s ease-in-out infinite; }
    .animate-float-medium { animation: float-medium 3s ease-in-out infinite; }
    .animate-float-fast { animation: float-fast 2s ease-in-out infinite; }
  `]
})
export class GoodbyeAnimationComponent implements OnInit {
  @Output() animationComplete = new EventEmitter<void>();

  animationState = 'in';

  ngOnInit() {
    // Auto-hide after 2.5 seconds
    setTimeout(() => {
      this.hideAnimation();
    }, 2500);
  }

  hideAnimation() {
    this.animationState = 'out';
  }

  onAnimationDone(event: any) {
    if (event.toState === 'out') {
      this.animationComplete.emit();
    }
  }
}
