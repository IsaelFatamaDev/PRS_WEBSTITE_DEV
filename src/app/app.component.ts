import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AnimationService } from './core/services/animation.service';
import { WelcomeAnimationComponent } from './shared/components/animations/welcome-animation.component';
import { GoodbyeAnimationComponent } from './shared/components/animations/goodbye-animation.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, WelcomeAnimationComponent, GoodbyeAnimationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'sistemaJass';
  showWelcomeAnimation = false;
  showGoodbyeAnimation = false;

  private subscriptions: Subscription[] = [];

  constructor(private animationService: AnimationService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.animationService.showWelcome$.subscribe(show => {
        this.showWelcomeAnimation = show;
      }),
      this.animationService.showGoodbye$.subscribe(show => {
        this.showGoodbyeAnimation = show;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onWelcomeAnimationComplete() {
    this.animationService.hideWelcomeAnimation();
  }

  onGoodbyeAnimationComplete() {
    this.animationService.hideGoodbyeAnimation();
  }
}
