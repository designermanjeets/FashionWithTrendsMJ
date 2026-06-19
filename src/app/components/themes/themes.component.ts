import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store, Select } from '@ngxs/store';
import { Observable, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { ThemeState } from '../../shared/state/theme.state';
import { GetHomePage } from '../../shared/action/theme.action';
import { ThemeOptionService } from '../../shared/services/theme-option.service';

@Component({
  selector: 'app-themes',
  templateUrl: './themes.component.html',
  styleUrls: ['./themes.component.scss']
})
export class ThemesComponent implements OnDestroy {

  @Select(ThemeState.homePage) homePage$: Observable<string>;
  @Select(ThemeState.activeTheme) activeTheme$: Observable<string>;

  public theme: string;
  public homePage: any;

  private destroy$ = new Subject<void>();

  constructor(private store: Store,
    private route: ActivatedRoute,
    private themeOptionService: ThemeOptionService) {

    this.route.queryParams.pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.themeOptionService.preloader = true;
        const activeTheme = this.store.selectSnapshot(ThemeState.activeTheme);
        this.theme = params['theme'] ? params['theme'] : activeTheme;
        return this.store.dispatch(new GetHomePage(this.theme));
      })
    ).subscribe(data => {
      this.homePage = data.theme.homePage;
      this.themeOptionService.preloader = false;
    });

    document.body.classList.add('home');
  }

  ngOnDestroy() {
    document.body.classList.remove('home');
    this.destroy$.next();
    this.destroy$.complete();
  }
}
