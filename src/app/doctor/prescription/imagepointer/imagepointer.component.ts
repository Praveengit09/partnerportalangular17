
import { Component, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: "imagepointer",
  templateUrl: "./imagepointer.template.html",
  styleUrls: ["./imagepointer.style.scss"],
  encapsulation: ViewEncapsulation.Emulated
})
export class ImagePointerComponent {


  @Input("imageUrl") imageUrl: string = '';
  @Output("onSave") onSave = new EventEmitter<any>();

  saveImage(e) {
    console.log(e);


    // let blob = new Blob(e, { type: 'image/png' });
    let file = new File([e], "filename.png", { type: 'image/png', lastModified: Date.now() });

    console.log(file, e)
    this.onSave.emit(file);
  } 


  cancelEdit(e) {
  }



}