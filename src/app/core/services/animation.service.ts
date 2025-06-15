import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
     providedIn: 'root'
})
export class AnimationService {
     private showWelcomeSubject = new BehaviorSubject<boolean>(false);
     private showGoodbyeSubject = new BehaviorSubject<boolean>(false);

     public showWelcome$ = this.showWelcomeSubject.asObservable();
     public showGoodbye$ = this.showGoodbyeSubject.asObservable();

     showWelcomeAnimation(): void {
          this.showWelcomeSubject.next(true);
     }

     hideWelcomeAnimation(): void {
          this.showWelcomeSubject.next(false);
     }

     showGoodbyeAnimation(): void {
          this.showGoodbyeSubject.next(true);
     }

     hideGoodbyeAnimation(): void {
          this.showGoodbyeSubject.next(false);
     }
}
