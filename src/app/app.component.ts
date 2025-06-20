import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private translate: TranslateService) { }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    document.documentElement.dir = this.translate.currentLang === 'ar' ? 'rtl' : 'ltr';
  }
  title = 'frontend';
}
