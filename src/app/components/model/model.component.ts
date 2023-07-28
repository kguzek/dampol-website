import { Component, OnDestroy, OnInit } from '@angular/core';
import { scrollToTop } from '../scroll-to-top/scroll-to-top.component';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MODELS } from '../products/model.data';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss'],
})
export class ModelComponent implements OnInit, OnDestroy {
  constructor(private router: Router, private route: ActivatedRoute) {}

  private ngUnsubscribe = new Subject<void>();
  modelNumber = +(this.router.url.split('/').at(-1) ?? 1);
  model = MODELS[this.modelNumber - 1];

  unsubscribe() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnInit() {
    const contactElement = document.getElementById('contact');

    this.router.events
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((event) => {
        if (event.type === 15) {
          scrollToTop();
          this.unsubscribe();
          return;
        }
      });
    this.route.fragment.subscribe((fragment) => {
      if (fragment !== 'contact') return;
      contactElement?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  ngOnDestroy() {
    this.unsubscribe();
  }
}
