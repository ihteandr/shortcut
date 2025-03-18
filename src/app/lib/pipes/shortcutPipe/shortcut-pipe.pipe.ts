import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortcutPipe',
  standalone: true
})
export class ShortcutPipePipe implements PipeTransform {

  transform(value: string): string[] {
    return value.split('+').filter((i) => !!i);
  }

}
