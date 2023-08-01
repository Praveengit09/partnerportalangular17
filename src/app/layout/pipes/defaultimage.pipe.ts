import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'defaultImage' })
export class DefaultImagePipe implements PipeTransform {

    imagePath: string = "assets/img/avatar.png";
    transform(value: string, fallback: string): any {
        let image = "";
        if (value) {
            image = value;
        } else {
            image = fallback;
        }
        return image;
    }
}
