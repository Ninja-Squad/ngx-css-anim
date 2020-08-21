import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { NgxCssAnimModule } from 'ngx-css-anim';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, FormsModule, NgxCssAnimModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
