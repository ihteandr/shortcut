import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, forwardRef, Input, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ShortcutPipePipe } from '../lib/pipes/shortcutPipe/shortcut-pipe.pipe';
import { filter, fromEvent, map, Subscription, tap } from 'rxjs';

@Component({
  selector: 'shortcut-input',
  standalone: true,
  imports: [CommonModule, FormsModule, ShortcutPipePipe],
  templateUrl: './shortcut.component.html',
  styleUrls: ['./shortcut.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ShortcutComponent),
      multi: true
    }
  ]
})
export class ShortcutComponent implements ControlValueAccessor {
  @Input() modifiers: string[] = [];
  @ViewChild('input') inputElement!: ElementRef<HTMLInputElement>;
  
  onChange = (value: string) => {};
  onTouched = () => {};


  value: string = '';
  active: boolean = false;
  isValid: boolean = false;
  testValue: string = '';

  private subscriptions: Subscription = new Subscription();

  ngAfterViewInit() {
    const input = this.inputElement.nativeElement;

    const focus$ = fromEvent(input, 'focus').pipe(
      tap(() => this.changeActiveState(true))
    );
    const blur$ = fromEvent(input, 'blur').pipe(
      tap(() => this.changeActiveState(false))
    );
    const keydown$ = fromEvent<KeyboardEvent>(input, 'keydown').pipe(
      tap(event => event.preventDefault()),
      map(event => this.processKeyPress(event))
    );
    const keyup$ = fromEvent<KeyboardEvent>(input, 'keyup').pipe(
      map(event => this.processKeyUp(event))
    );

    this.subscriptions.add(focus$.subscribe());
    this.subscriptions.add(blur$.subscribe());
    this.subscriptions.add(keydown$.subscribe());
    this.subscriptions.add(keyup$.subscribe());
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();  // Cleanup observables
  }
  excludeModifiers (event: KeyboardEvent) {
    let isLocalValid = true;
    let key = event.key;
    let result = '';
    if (event.ctrlKey) {
      result += 'Ctrl+';
      key = key.replace('Control', '').replace('Ctrl', '');
      if (!this.modifiers.includes('Ctrl')) {
        isLocalValid = false;
      }
    }
    if (event.shiftKey) {
      result += 'Shift+';
      key = key.replace('Shift', '');
      if (!this.modifiers.includes('Shift')) {
        isLocalValid = false;
      }
    }
    if (event.altKey) {
      result += 'Alt+';
      key = key.replace('Alt', '');
      if (!this.modifiers.includes('Alt')) {
        isLocalValid = false;
      }
    }
    if (event.metaKey) {
      result += 'Meta+';
      key = key.replace('Meta', '');
      if (!this.modifiers.includes('Meta')) {
        isLocalValid = false;
      }
    }
    if (event.getModifierState('CapsLock')) {
      result += 'CapsLock+';
      key = key.replace('CapsLock', '');
      if (!this.modifiers.includes('CapsLock')) {
        isLocalValid = false;
      }
    }
    return { result, key, isLocalValid };
  }
  processKeyPress (event: KeyboardEvent) {
    const { result: localResut, key, isLocalValid } = this.excludeModifiers(event);
    let result = localResut;
    if (!isLocalValid || result.length === 0 || !key) {
      this.isValid = false
    } else {
      this.isValid = true;
    }
    result += key;
    this.testValue = result;
  }
  processKeyUp (event: KeyboardEvent) {
    if (this.isValid) {
      this.updateValue({ target: { value: this.testValue} });
    } else {
      this.testValue = '';
      this.updateValue({ target: { value: ''} });  
    }
  }

  updateValue(event: any) {
    this.value = event.target.value;
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  changeActiveState (state: boolean) {
      this.active = state;
      if (this.active) {
        this.inputElement.nativeElement.focus();
      }
  }
}
