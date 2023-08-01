import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, TemplateRef } from '@angular/core';
import { fabric } from 'fabric'
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { ToasterService } from '../../../layout/toaster/toaster.service';
declare global {
    interface Window {
        showSaveFilePicker: any;
    }
}


@Component({
    selector: 'imagedrawing',
    styleUrls: ['./imagedrawing.style.scss'],
    templateUrl: './imagedrawing.template.html'
})

export class ImageDrawingComponent implements OnInit, OnChanges {

    src: string;
    width: number = 750;
    height: number = 580;

    forceSizeCanvas: boolean = true;
    forceSizeExport: boolean = true;
    enableRemoveImage: boolean = true;
    enableLoadAnotherImage: boolean = true;
    enableTooltip: boolean = true;
    showCancelButton: boolean = true;
    enableTextInput: boolean = false;

    public loadingTemplate?: TemplateRef<any>;
    public errorTemplate?: TemplateRef<any>;

    outputMimeType = 'image/jpeg';
    outputQuality = 0.8;

    drawingSizes: { [name: string]: number } = {
        small: 1,
        medium: 5,
        large: 10,
        xtralarge: 25
    };

    colors: { [name: string]: string } = {
        black: '#000',
        white: '#fff',
        gray: '#9e9e9e',
        yellow: '#ffeb3b',
        red: '#f44336',
        blue: '#2196f3',
        green: '#4caf50',
        purple: '#7a08af',
        pink: '#e91e63',
        orange: '#ff9800'
    };

    @Output() save: EventEmitter<Blob> = new EventEmitter<Blob>();
    @Output() cancel: EventEmitter<void> = new EventEmitter<void>();
    @Output() annotatedImage: EventEmitter<string> = new EventEmitter<string>();

    currentTool: string = 'brush';
    currentSize: string = 'medium';
    currentColor: string = 'black';
    currentColorValue: string;
    currentSizeValue: number;

    canUndo: boolean = false;
    canRedo: boolean = false;

    isLoading: boolean = false;
    hasError: boolean = false;
    errorMessage: string = '';

    private canvas: fabric.Canvas;
    private stack: fabric.Object[] = [];

    colorsName: string[] = [];
    drawingSizesName: string[] = [];

    imageUsed?: fabric.Image;
    selectedImage: string;
    textInput: string = '';

    constructor(private toast: ToasterService) {
    }
    ngOnInit() {
        this.colorsName = Object.keys(this.colors);
        this.drawingSizesName = Object.keys(this.drawingSizes);

        if (!this.selectedImage) {
            this.selectedImage = 'Select an Organ';
        }

        this.canvas = new fabric.Canvas('canvas', {
            hoverCursor: 'pointer',
            isDrawingMode: true,
        });

        this.canvas.backgroundColor = 'white';

        if (this.src) {
            this.importPhotoFromSrc(this.src);
        } else {
            if (!this.width || !this.height) {
                throw new Error('No width or hight given !');
            }

            this.canvas.setWidth(this.width);
            this.canvas.setHeight(this.height);
        }

        this.canvas.on('path:created', () => {
            this.stack = [];
            this.setUndoRedo();
        });

        this.selectTool(this.currentTool);
        this.selectColor(this.currentColor);
        this.selectDrawingSize(this.currentSize);
    }

    // Tools
    selectTool(tool: string) {
        this.currentTool = tool;
        if (this.currentTool == 'brush') {
            this.canvas.isDrawingMode = true;
            const brush = new fabric.PencilBrush(this.canvas);
            brush.color = this.currentColorValue;
            brush.width = this.currentSizeValue;
            this.canvas.freeDrawingBrush = brush;
            this.canvas.freeDrawingBrush.color = this.currentColor;
            this.canvas.hoverCursor = 'pointer';
            this.enableTextInput = false;
        }
        else if (this.currentTool == 'pan_tool') {
            this.canvas.isDrawingMode = false;
            this.canvas.selection = true;
            this.canvas.defaultCursor = 'default';
            this.canvas.hoverCursor = 'grab';
            this.enableTextInput = false;
            document.addEventListener('keydown', (event) => {
                if ((event.code === 'Space' || event.code === 'Delete') && this.canvas.getActiveObject()) {
                    this.canvas.remove(this.canvas.getActiveObject());
                    this.canvas.remove(...this.canvas.getActiveObjects());
                }
            });
        }
        else if (this.currentTool == 'eraser') {
            const ErasedGroup = fabric.util.createClass(fabric.Group, {
                original: null,
                erasedPath: null,
                initialize: function (original, erasedPath, options, isAlreadyGrouped) {
                    this.original = original;
                    this.erasedPath = erasedPath;
                    this.callSuper('initialize', [this.original, this.erasedPath], options, isAlreadyGrouped);
                },

                _calcBounds: function (onlyWidthHeight) {
                    const aX = [],
                        aY = [],
                        props = ['tr', 'br', 'bl', 'tl'],
                        jLen = props.length,
                        ignoreZoom = true;

                    let o = this.original;
                    o.setCoords(ignoreZoom);
                    for (let j = 0; j < jLen; j++) {
                        const prop = props[j];
                        aX.push(o.oCoords[prop].x);
                        aY.push(o.oCoords[prop].y);
                    }

                    this._getBounds(aX, aY, onlyWidthHeight);
                },
            });


            const EraserBrush = fabric.util.createClass(fabric.PencilBrush, {
                _finalizeAndAddPath: function () {
                    var ctx = this.canvas.contextTop;
                    ctx.closePath();
                    if (this.decimate) {
                        this._points = this.decimatePoints(this._points, this.decimate);
                    }
                    var pathData = this.convertPointsToSVGPath(this._points).join('');
                    if (pathData === 'M 0 0 Q 0 0 0 0 L 0 0') {

                        this.canvas.requestRenderAll();
                        return;
                    }

                    // use globalCompositeOperation to 'fake' eraser
                    var path = this.createPath(pathData);
                    path.globalCompositeOperation = 'destination-out';
                    path.selectable = false;
                    path.evented = false;
                    path.absolutePositioned = true;

                    // grab all the objects that intersects with the path
                    const objects = this.canvas.getObjects().filter((obj) => {
                        if (!obj.intersectsWithObject(path)) return false;
                        return true;
                    });

                    if (objects.length > 0) {

                        // merge those objects into a group
                        const mergedGroup = new fabric.Group(objects);

                        // This will perform the actual 'erasing' 
                        const newPath = new ErasedGroup(mergedGroup, path);
                        const left = newPath.left;
                        const top = newPath.top;

                        // convert it into a dataURL, then back to a fabric image
                        const newData = newPath.toDataURL({
                            withoutTransform: true
                        });
                        fabric.Image.fromURL(newData, (fabricImage) => {
                            fabricImage.set({
                                left: left,
                                top: top,
                            });

                            // remove the old objects then add the new image
                            this.canvas.remove(...objects);
                            this.canvas.add(fabricImage);
                        });
                    }
                    this.canvas.clearContext(this.canvas.contextTop);
                    this.canvas.renderAll();
                    this._resetShadow();
                },
            });

            const eraserBrush = new EraserBrush(this.canvas);
            eraserBrush.width = this.currentSizeValue;
            this.canvas.freeDrawingBrush = eraserBrush;
            this.canvas.isDrawingMode = true;
            this.canvas.freeDrawingBrush.color = 'white';
            this.canvas.hoverCursor = 'pointer';
            this.enableTextInput = false;
        }
        else if (this.currentTool == 'text_fields') {
            this.enableTextInput = true;
            this.canvas.isDrawingMode = false;
            this.canvas.selection = false;
            this.canvas.defaultCursor = 'default';
            this.canvas.hoverCursor = 'pointer';
        }
    }

    selectDrawingSize(size: string) {
        this.currentSize = size;
        if (this.canvas) {
            this.canvas.freeDrawingBrush.width = this.drawingSizes[size];
            this.currentSizeValue = this.drawingSizes[size];
        }
    }

    selectColor(color: string) {
        this.currentColor = color;
        if (this.canvas) {
            this.canvas.freeDrawingBrush.color = this.colors[color];
            this.currentColorValue = this.colors[color];
        }
    }

    // Actions
    undo() {
        if (this.canUndo) {
            const lastId = this.canvas.getObjects().length - 1;
            const lastObj = this.canvas.getObjects()[lastId];
            this.stack.push(lastObj);
            this.canvas.remove(lastObj);
            this.setUndoRedo();
        }
    }

    redo() {
        if (this.canRedo) {
            const firstInStack = this.stack.splice(-1, 1)[0];
            if (firstInStack) {
                this.canvas.insertAt(firstInStack, this.canvas.getObjects().length - 1, false);
            }
            this.setUndoRedo();
        }
    }

    zoomIn() {
        var zoom = this.canvas.getZoom();
        zoom *= 1.1;
        this.canvas.setZoom(zoom);
        this.canvas.renderAll();
    }

    zoomOut() {
        var zoom = this.canvas.getZoom();
        zoom /= 1.1;
        this.canvas.setZoom(zoom);
        this.canvas.renderAll();
    }

    addShapes(shape: string) {
        this.setUndoRedo();
        let newShape;
        switch (shape) {
            case 'circle':
                newShape = new fabric.Circle({
                    left: 10,
                    top: 10,
                    radius: 50,
                    fill: 'transparent',
                    stroke: this.currentColorValue,
                    strokeWidth: 2
                });
                break;
            case 'square':
                newShape = new fabric.Rect({
                    left: 20,
                    top: 20,
                    width: 50,
                    height: 50,
                    fill: 'transparent',
                    stroke: this.currentColorValue,
                    strokeWidth: 2
                });
                break;
            case 'line':
                newShape = new fabric.Line([10, 10, 100, 10], {
                    left: 40,
                    top: 30,
                    stroke: this.currentColorValue,
                    strokeWidth: 2
                });
                break;
            case 'arrow_backward':
                newShape = new fabric.Path('M50 100 L10 60 L50 20 M10 60 L90 60', {
                    left: 50,
                    top: 50,
                    fill: 'transparent',
                    stroke: this.currentColorValue,
                    strokeWidth: 2
                });
                break;
            case 'text':
                newShape = new fabric.Text(this.textInput, {
                    left: 30,
                    top: 60,
                    fontSize: 16,
                    stroke: this.currentColorValue,
                });
                break;
            default:
                break;
        }

        if (newShape) {
            this.canvas.add(newShape);
            this.canvas.renderAll();
            this.textInput = '';
        }
    }


    clearCanvas() {
        if (this.canvas) {
            this.canvas.remove(...this.canvas.getObjects());
            this.setUndoRedo();
        }
    }

    saveImage() {
        if (!this.forceSizeExport || (this.forceSizeExport && this.width && this.height)) {
            const canvasScaledElement: HTMLCanvasElement = document.createElement('canvas');
            const canvasScaled = new fabric.Canvas(canvasScaledElement);
            canvasScaled.backgroundColor = 'white';

            new Observable<fabric.Canvas>(observer => {
                if (this.imageUsed) {
                    if (this.forceSizeExport) {
                        canvasScaled.setWidth(this.width);
                        canvasScaled.setHeight(this.height);

                        this.imageUsed.cloneAsImage(imageCloned => {
                            imageCloned.scaleToWidth(this.width, false);
                            imageCloned.scaleToHeight(this.height, false);

                            canvasScaled.setBackgroundImage(imageCloned, (img: HTMLImageElement) => {
                                if (!img) {
                                    observer.error(new Error('Impossible to draw the image on the temporary canvas'));
                                }

                                observer.next(canvasScaled);
                                observer.complete();
                            }, {
                                crossOrigin: 'anonymous',
                                originX: 'left',
                                originY: 'top'
                            });
                        });
                    } else {
                        canvasScaled.setBackgroundImage(this.imageUsed, (img: HTMLImageElement) => {
                            if (!img) {
                                observer.error(new Error('Impossible to draw the image on the temporary canvas'));
                            }

                            canvasScaled.setWidth(img.width);
                            canvasScaled.setHeight(img.height);

                            observer.next(canvasScaled);
                            observer.complete();
                        }, {
                            crossOrigin: 'anonymous',
                            originX: 'left',
                            originY: 'top'
                        });
                    }
                } else {
                    canvasScaled.setWidth(this.width);
                    canvasScaled.setHeight(this.height);
                }
            }).pipe(
                switchMap(() => {
                    let process = of(canvasScaled);

                    if (this.canvas.getObjects().length > 0) {
                        const ratioX = canvasScaled.getWidth() / this.canvas.getWidth();
                        const ratioY = canvasScaled.getHeight() / this.canvas.getHeight();

                        this.canvas.getObjects().forEach((originalObject: fabric.Object, i: number) => {
                            process = process.pipe(switchMap(() => {
                                return new Observable<fabric.Canvas>(observerObject => {
                                    originalObject.clone((clonedObject: fabric.Object) => {
                                        clonedObject.set('left', originalObject.left * ratioX);
                                        clonedObject.set('top', originalObject.top * ratioY);
                                        clonedObject.scaleToWidth(originalObject.width * ratioX);
                                        clonedObject.scaleToHeight(originalObject.height * ratioY);

                                        canvasScaled.insertAt(clonedObject, i, false);
                                        canvasScaled.renderAll();

                                        observerObject.next(canvasScaled);
                                        observerObject.complete();
                                    });
                                });
                            }));
                        });
                    }
                    return process;
                }),
            ).subscribe(() => {
                canvasScaled.renderAll();
                canvasScaled.getElement().toBlob(
                    async (blob: Blob) => {
                        const fileHandle = await window.showSaveFilePicker({
                            suggestedName: 'blob',
                            types: [
                                {
                                    description: 'PNG image',
                                    accept: {
                                        'image/png': ['.png'],
                                    },
                                },
                            ],
                        });
                        const writable = await fileHandle.createWritable();
                        await writable.write(blob);
                        await writable.close();
                    },
                    this.outputMimeType,
                    this.outputQuality
                );
            });
        } else {
            this.canvas.getElement().toBlob(
                async (blob: Blob) => {
                    const fileHandle = await window.showSaveFilePicker({
                        suggestedName: 'blob',
                        types: [
                            {
                                description: 'PNG image',
                                accept: {
                                    'image/png': ['.png'],
                                },
                            },
                        ],
                    });
                    const writable = await fileHandle.createWritable();
                    await writable.write(blob);
                    await writable.close();
                },
                this.outputMimeType,
                this.outputQuality
            );
        }
    }

    downloadImage() {
        if (!this.forceSizeExport || (this.forceSizeExport && this.width && this.height)) {
            const canvasScaledElement: HTMLCanvasElement = document.createElement('canvas');
            const canvasScaled = new fabric.Canvas(canvasScaledElement);
            canvasScaled.backgroundColor = 'white';

            new Observable<fabric.Canvas>(observer => {
                if (this.imageUsed) {
                    if (this.forceSizeExport) {
                        canvasScaled.setWidth(this.width);
                        canvasScaled.setHeight(this.height);

                        this.imageUsed.cloneAsImage(imageCloned => {
                            imageCloned.scaleToWidth(this.width, false);
                            imageCloned.scaleToHeight(this.height, false);

                            canvasScaled.setBackgroundImage(imageCloned, (img: HTMLImageElement) => {
                                if (!img) {
                                    observer.error(new Error('Impossible to draw the image on the temporary canvas'));
                                }

                                observer.next(canvasScaled);
                                observer.complete();
                            }, {
                                crossOrigin: 'anonymous',
                                originX: 'left',
                                originY: 'top'
                            });
                        });
                    } else {
                        canvasScaled.setBackgroundImage(this.imageUsed, (img: HTMLImageElement) => {
                            if (!img) {
                                observer.error(new Error('Impossible to draw the image on the temporary canvas'));
                            }

                            canvasScaled.setWidth(img.width);
                            canvasScaled.setHeight(img.height);

                            observer.next(canvasScaled);
                            observer.complete();
                        }, {
                            crossOrigin: 'anonymous',
                            originX: 'left',
                            originY: 'top'
                        });
                    }
                } else {
                    canvasScaled.setWidth(this.width);
                    canvasScaled.setHeight(this.height);
                }
            }).pipe(
                switchMap(() => {
                    let process = of(canvasScaled);

                    if (this.canvas.getObjects().length > 0) {
                        const ratioX = canvasScaled.getWidth() / this.canvas.getWidth();
                        const ratioY = canvasScaled.getHeight() / this.canvas.getHeight();

                        this.canvas.getObjects().forEach((originalObject: fabric.Object, i: number) => {
                            process = process.pipe(switchMap(() => {
                                return new Observable<fabric.Canvas>(observerObject => {
                                    originalObject.clone((clonedObject: fabric.Object) => {
                                        clonedObject.set('left', originalObject.left * ratioX);
                                        clonedObject.set('top', originalObject.top * ratioY);
                                        clonedObject.scaleToWidth(originalObject.width * ratioX);
                                        clonedObject.scaleToHeight(originalObject.height * ratioY);

                                        canvasScaled.insertAt(clonedObject, i, false);
                                        canvasScaled.renderAll();

                                        observerObject.next(canvasScaled);
                                        observerObject.complete();
                                    });
                                });
                            }));
                        });
                    }
                    return process;
                }),
            ).subscribe(() => {
                canvasScaled.renderAll();
                canvasScaled.getElement().toBlob(
                    (blob: Blob) => {
                        saveAs(blob, 'blob');
                    },
                    this.outputMimeType,
                    this.outputQuality
                );
            });
        }
    }

    cancelAction() {
        this.cancel.emit();
    }

    setUndoRedo() {
        this.canUndo = this.canvas.getObjects().length > 0;
        this.canRedo = this.stack.length > 0;
    }

    importPhotoFromFile(event: Event | any) {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            if (file.type.match('image.*')) {
                this.importPhotoFromBlob(file);
            } else {
                throw new Error('Not an image !');
            }
        }
    }

    removeImage() {
        if (this.imageUsed) {
            this.imageUsed.dispose();
            this.imageUsed = null;
        }
        this.canvas.backgroundImage = null;

        if (this.width && this.height) {
            this.canvas.setWidth(this.width);
            this.canvas.setHeight(this.height);
        }
        this.stack = [];
        this.canvas.renderAll();
    }

    public get hasImage(): boolean {
        return !!this.canvas.backgroundImage;
    }

    importPhotoFromSrc(src: string) {
        this.isLoading = true;
        let isFirstTry = true;
        const imgEl = new Image();
        imgEl.setAttribute('crossOrigin', 'anonymous');
        imgEl.src = src;
        imgEl.onerror = () => {
            // Retry with cors proxy
            if (isFirstTry) {
                imgEl.src = 'https://cors-anywhere.herokuapp.com/' + this.src;
                isFirstTry = false;
            } else {
                this.isLoading = false;
                this.hasError = true;
                this.errorMessage = "unable to load image";
                setTimeout(() => {
                    this.hasError = false;
                }, 2000);
            }
        };
        imgEl.onload = () => {
            this.isLoading = false;
            this.imageUsed = new fabric.Image(imgEl);

            this.imageUsed.cloneAsImage(image => {
                let width = imgEl.width;
                let height = imgEl.height;

                if (this.width) {
                    width = this.width;
                }
                if (this.height) {
                    height = this.height;
                }

                image.scaleToWidth(width, false);
                image.scaleToHeight(height, false);

                this.canvas.setBackgroundImage(image, ((img: HTMLImageElement) => {
                    if (img) {
                        if (this.forceSizeCanvas) {
                            this.canvas.setWidth(width);
                            this.canvas.setHeight(height);
                        } else {
                            this.canvas.setWidth(image.getScaledWidth());
                            this.canvas.setHeight(image.getScaledHeight());
                        }
                    }
                }), {
                    crossOrigin: 'anonymous',
                    originX: 'left',
                    originY: 'top'
                });
            });
        };
    }

    importPhotoFromBlob(file: Blob | File) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (evtReader: any) => {
            if (evtReader.target.readyState == FileReader.DONE) {
                this.importPhotoFromSrc(evtReader.target.result);
            }
        };
    }

    importPhotoFromUrl() {
        const url = prompt('loadImageUrl');
        if (url) {
            this.importPhotoFromSrc(url);
        }
    }

    onDropdownChanged(value) {
        this.selectedImage = value;
        this.importPhotoFromSrc(this.selectedImage);
    }

    addToPrescription() {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const annotatedImageData = canvas.toDataURL('image/png');
        this.annotatedImage.emit(annotatedImageData);
        this.toast.show("Annotated Image Added to Prescription Successfully", "bg-success text-white font-weight-bold", 3000);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['src'] && !changes['src'].firstChange && changes['src'].currentValue) {
            if (typeof changes['src'].currentValue === 'string') {
                this.importPhotoFromSrc(changes['src'].currentValue);
            } else if (changes['src'].currentValue instanceof Blob) {
                this.importPhotoFromBlob(changes['src'].currentValue);
            }
        }
    }
}