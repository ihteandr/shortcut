import { Component } from '@angular/core';
import { ShortcutComponent } from './shortcut/shortcut.compoment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ShortcutComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app';
  data: string = '';
  modifiers: string[] = ['Shift', 'CapsLock', 'Meta'];
  updateData(value: string) {
    this.data = value;
  } 
}
