import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HtmlEventsService } from '../../services/html-events.service';
import { ToolsEventsService } from '../../services/tools-events.service';

@Component({
  selector: 'app-page-generator',
  templateUrl: './page-generator.component.html',
  styleUrls: ['./page-generator.component.css'],
})
export class PageGeneratorComponent implements OnInit, OnDestroy {
  destroy: Subject<boolean> = new Subject<boolean>();
  @Output() DataLoaded = new EventEmitter<any>();
  // tslint:disable-next-line:no-input-rename
  @Input('scalling') scaleXY: string;
  // tslint:disable-next-line:no-input-rename
  @Input('file') selectedFile: any;
  // tslint:disable-next-line:no-input-rename
  @Input('mode') mode: any;
  // tslint:disable-next-line:no-input-rename
  @ViewChild('pdfViewerOnDemand') pdfViewerOnDemand;
  covnertResult: string;
  currentPageNumber: any;
  nextCorrectWidth: number;
  grandParent: Element;
  loading: any;
  optionDraw: string;
  activate: boolean;
  PDFJs: any;
  totalPageNumber: any;
  pageOffsetHeight: number;
  pageNumberChangedByNavigator = false;
  scalledValue: any = 0;
  offsetYHolder: any;
  zoomHolder = 0;
  selectMode;
  selectToolData;
  selectedText: any;
  pdfFile: any;
  eventData: any;
  zoomingValue = 100;
  zoomHolderParent: any;
  previewDataHolder;
  specificPageToShow = false;
  loader = false;
  constructor(
    private convertToHtml: HtmlEventsService,
    private toolManagement: ToolsEventsService
  ) {}

  activateDrawing(): void {
    let newTool;
    this.toolManagement.getnewTool().subscribe((tool) => {
      const iframe = document.getElementsByTagName('iframe');
      newTool = tool.tool;
      if (tool.selectMode) {
        this.selectMode = tool.selectMode;
        this.selectToolData = tool;
        this.setFrameSelectTextState(true);
        return;
      }
      if (newTool === 'none_selected') {
        this.optionDraw = null;
        this.activate = false;
        this.setFramesDrawingState(false);
        this.setFrameSelectTextState(false);
        return;
      }
      this.optionDraw = newTool;
      this.activate = true;
      this.setFramesDrawingState(true);
    });
  }

  activateListeners(newPageLoaded = 0): void {
    setTimeout(() => {
      const that = this;
      const frames = document.getElementsByTagName('iframe')[0];
      if (!frames) {
        return;
      }
      if (!newPageLoaded) {
        const x = `
          const mouseDownHandler = function(ev){
            let PND = 1;
            if(ev.originalTarget) {
              PND = ev.originalTarget.offsetParent.dataset.pageNumber
            } else {
              PND = Number(ev.path[2].dataset.pageNumber ? ev.path[2].dataset.pageNumber : ev.path[1].dataset.pageNumber)
            }
            const eev = {
              X: ev.x,
              Y: ev.y - 34,
              startX: ev.offsetX,
              startY: ev.offsetY,
              Page_Number: PND,
            }
            window.parent.postMessage({action: 'mouseDown', e: eev}, "*");
          }
          const mouseMoveHandler = function(ev){
            let PNM = 1;
            if(ev.originalTarget) {
              PNM = ev.originalTarget.offsetParent.dataset.pageNumber
            } else {
              PNM = Number(ev.path[2].dataset.pageNumber ? ev.path[2].dataset.pageNumber : ev.path[1].dataset.pageNumber)
            }
            const eev = {
              X: ev.x,
              Y: ev.y - 34,
              Page_Number: PNM,

            }
            window.parent.postMessage({action: 'mouseMoved', e: eev}, "*");
          }

          document.querySelectorAll('.page').forEach(i => {
            i.addEventListener("mousedown", mouseDownHandler)
            i.addEventListener("mousemove", mouseMoveHandler)
          });

          `;
        (frames.contentWindow as any).eval(x);
        that.toolManagement.addEventListenerWindow(true);
      }
    });
  }

  activateSelectTextListener(): void {
    const that = this;
    const frames = document.getElementsByTagName('iframe')[0];
    frames.contentWindow.document
      .querySelectorAll('.textLayer')
      .forEach((textLayer) => {
        if ((textLayer as any).getAttribute('Listener')) {
          return;
        }
        (textLayer as any).style.pointerEvents = 'auto';
        (textLayer as any).setAttribute('Listener', true);
        (textLayer as any).addEventListener('mouseup', (event) => {
          let divPageIndex = 1;
          divPageIndex =
            event.target.offsetParent.offsetParent.dataset.pageNumber;
          const resultHighlight = that.getSelectedText();
          // that.selectedText = resultHighlight.toString();
          that.highLightText(resultHighlight);

          if (!that.selectedText) {
            return;
          }
          this.toolManagement.emitNewSelectedText({
            type: this.selectToolData.tool,
            value: this.escapeSpecialCharacters(that.selectedText),
            pageNumber: Number(divPageIndex),
            selectMode: true,
          });
        });
        (textLayer as any).addEventListener('mousedown', (event) => {
          if (!this.selectToolData) {
            return;
          }
          const splited = this.selectToolData.tool.split('_');
          const index = splited.findIndex((el) => el.length === 1);
          const colors = {
            B: '#2ed105',
            E: '#fc664b',
            A: '#4b89fc',
          };
          if (
            frames.contentWindow.document.querySelectorAll('.' + splited[index])
              .length
          ) {
            frames.contentWindow.document
              .querySelectorAll('.' + splited[index])
              .forEach((element) => {
                element.remove();
              });
          }
        });
      });
  }

  escapeSpecialCharacters(text): any {
    let result = null;
    result = text;
    const characterTobeEscaped = [
      { char: /[\.]+/g, replacement: '\\' + '.' },
      { char: /[\-]+/g, replacement: '\\' + '-' },
      { char: /[\^]+/g, replacement: '\\' + '^' },
      { char: /[\&]+/g, replacement: '\\' + '&' },
      { char: /[\<]+/g, replacement: '\\' + '<' },
      { char: /[\>]+/g, replacement: '\\' + '>' },
      { char: /[\|]+/g, replacement: '\\' + '|' },
      { char: /[\']+/g, replacement: '\\' + "'" },
      { char: /[\`]+/g, replacement: '\\' + '`' },
      { char: /[\,]+/g, replacement: '\\' + ',' },
      { char: /[\;]+/g, replacement: '\\' + ';' },
      { char: /[\=]+/g, replacement: '\\' + '=' },
      { char: /[\(]+/g, replacement: '\\' + '(' },
      { char: /[\)]+/g, replacement: '\\' + ')' },
      { char: /[\!]+/g, replacement: '\\' + '!' },
      { char: /[\"]+/g, replacement: '\\' + '"' },
      { char: /[\[]+/g, replacement: '\\' + '[' },
      { char: /[\]]+/g, replacement: '\\' + ']' },
      { char: /[\*]+/g, replacement: '\\' + '*' },
      { char: /[\:]+/g, replacement: '\\' + ':' },
      { char: /[\?]+/g, replacement: '\\' + '?' },
      { char: /[\/\?]+/g, replacement: '\\' + '/' },
      { char: /[\ ]+/g, replacement: '[ ]*' },
      { char: /[\n]+/g, replacement: '[s]*' },
      /* {char: /[\’]+/g, replacement: '\\' + '’'} */
    ];
    characterTobeEscaped.forEach((character) => {
      const regex = character.char;
      result = result.replaceAll(regex, character.replacement);
    });
    return result;
  }

  checkPreviewMode(): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    this.toolManagement
      .getPreviewData()
      .pipe(takeUntil(this.destroy))
      .subscribe((res) => {
        this.previewDataHolder = {
          marginsZoom: res.marginsZoom,
          envelope: res.envelope,
        };
        const pageOne =
          iframe.contentWindow.document.querySelectorAll('.page')[0];
        const envelope = document.querySelector('.envelope') as any;
        if (!pageOne) {
          return;
        }
        const top = pageOne.clientTop - (pageOne as any).offsetTop;
        const left = pageOne.clientLeft + (pageOne as any).offsetLeft;
        envelope.style.top = top + 'px';
        envelope.style.left = left + 'px';
        envelope.style.width = pageOne.getBoundingClientRect().width + 'px';
        envelope.style.height = pageOne.getBoundingClientRect().height + 'px';
        this.previewDataHolder.marginsZoom.forEach((style) => {
          if (style.type.includes('margin')) {
            style.value = style.value * 3.77 + 'px';
          }
          iframe.contentWindow.document.getElementById('page1').style[
            style.type
          ] = style.value;
        });
      });
  }

  getSelectedText(): any {
    const frames = document.getElementsByTagName('iframe')[0];
    let txt;
    if (frames.contentWindow.getSelection) {
      txt = frames.contentWindow.getSelection();
    } else if (frames.contentWindow.document.getSelection) {
      txt = frames.contentWindow.document.getSelection();
    } else if ((frames.contentWindow.document as any).selection) {
      txt = (frames.contentWindow.document as any).createRange().text;
    }
    return txt;
  }

  highLightText(txt): any {
    if (!this.selectToolData) {
      return;
    }
    const range = txt.getRangeAt(0);
    const frames = document.getElementsByTagName('iframe')[0];
    const splited = this.selectToolData.tool.split('_');
    const index = splited.findIndex((el) => el.length === 1);
    let highLightedText = '';
    const colors = {
      B: '#2ed105',
      E: '#fc664b',
      A: '#4b89fc',
    };
    if (
      frames.contentWindow.document.querySelectorAll('.' + splited[index])
        .length
    ) {
      frames.contentWindow.document
        .querySelectorAll('.' + splited[index])
        .forEach((element) => {
          element.remove();
        });
    }
    if (range.cloneContents().querySelectorAll('*').length) {
      range
        .cloneContents()
        .querySelectorAll('*')
        .forEach((child, childIndex) => {
          let offsetWiddthMultiple = 0;
          const span = document.createElement('span');
          span.style.backgroundColor = colors[splited[index]];
          span.style.fontSize = child.style.fontSize;
          span.style.fontFamily = child.style.fontFamily;
          span.style.transform = child.style.transform;
          span.innerHTML = child.innerHTML;
          span.className = splited[index];
          span.style.top = child.style.top;
          span.style.pointerEvents = 'none';
          highLightedText = highLightedText.concat(' ' + child.innerHTML);
          switch (childIndex) {
            case 0 && !range.startOffset: {
              offsetWiddthMultiple = this.prepareMultipleSpans(frames, range);
              span.style.left =
                Number(child.style.left.replace('px', '')) +
                offsetWiddthMultiple +
                'px';
              break;
            }
            default: {
              span.style.left = child.style.left;
              break;
            }
          }
          range.commonAncestorContainer.appendChild(span);
        });
      this.selectedText = highLightedText;
      txt.empty();
      return;
    }
    const spanText = document.createElement('span');
    const result = this.prepareSpan(range, frames);
    spanText.className = splited[index];
    spanText.style.backgroundColor = colors[splited[index]];
    spanText.style.top = range.commonAncestorContainer.parentNode.style.top;
    spanText.style.left =
      Number(
        range.commonAncestorContainer.parentNode.style
          .getPropertyValue('left')
          .replace('px', '')
      ) +
      result.offsetWidth +
      'px';
    spanText.style.fontSize =
      range.commonAncestorContainer.parentNode.style.fontSize;
    spanText.style.fontFamily =
      range.commonAncestorContainer.parentNode.style.fontFamily;
    spanText.style.transform =
      range.commonAncestorContainer.parentNode.style.transform;
    /* spanText.innerHTML = range.commonAncestorContainer.parentNode.innerHTML; */
    spanText.innerHTML = result.spanContent.trim();
    spanText.style.pointerEvents = 'none';
    highLightedText = this.getSelectedText().toString();
    range.commonAncestorContainer.parentNode.parentNode.appendChild(spanText);
    this.selectedText = highLightedText;
    txt.empty();
  }

  prepareSpan(range, frames): any {
    const spanTest = document.createElement('span');
    spanTest.style.cssText =
      range.commonAncestorContainer.parentNode.attributes[0].nodeValue;
    spanTest.innerText = range.commonAncestorContainer.textContent.substr(
      0,
      range.startOffset
    );
    const spanContent = range.commonAncestorContainer.textContent.substr(
      range.startOffset,
      range.endOffset - range.startOffset
    );
    const textLayer = frames.contentWindow.document.querySelectorAll(
      '.textLayer'
    )[this.currentPageNumber - 1]
      ? frames.contentWindow.document.querySelectorAll('.textLayer')[
          this.currentPageNumber - 1
        ]
      : frames.contentWindow.document.querySelectorAll('.textLayer')[
          frames.contentWindow.document.querySelectorAll('.textLayer').length -
            1
        ];
    textLayer.appendChild(spanTest);
    const offsetWidth = spanTest.getBoundingClientRect().width;
    spanTest.remove();
    return {
      offsetWidth,
      spanContent,
    };
  }

  prepareMultipleSpans(frame, range): any {
    const spanTest = document.createElement('span');
    spanTest.style.cssText =
      range.startContainer.parentNode.attributes[0].nodeValue;
    spanTest.innerText = range.startContainer.textContent.substr(
      0,
      range.startOffset
    );
    const textLayer = frame.contentWindow.document.querySelectorAll(
      '.textLayer'
    )[this.currentPageNumber - 1]
      ? frame.contentWindow.document.querySelectorAll('.textLayer')[
          this.currentPageNumber - 1
        ]
      : frame.contentWindow.document.querySelectorAll('.textLayer')[
          frame.contentWindow.document.querySelectorAll('.textLayer').length - 1
        ];
    textLayer.appendChild(spanTest);
    const offsetWidth = spanTest.getBoundingClientRect().width;
    spanTest.remove();
    return offsetWidth;
  }

  setFrameSelectTextState(state): void {
    const frames = document.getElementsByTagName('iframe')[0];
    if (state) {
      frames.contentWindow.document
        .querySelectorAll('.textLayer')
        .forEach((textLayer) => {
          (textLayer as any).style.pointerEvents = 'auto';
        });
    } else {
      frames.contentWindow.document
        .querySelectorAll('.textLayer')
        .forEach((textLayer) => {
          (textLayer as any).style.pointerEvents = 'none';
        });
    }
  }

  setFramesDrawingState(state, frame = null): void {
    const frames = document.getElementsByTagName('iframe')[0];
    if (frame) {
      if (state) {
        document
          .getElementById('container_pdf')
          .classList.add('in-drawing-mode-parent');
        frames.contentWindow.document
          .getElementById('viewer')
          .classList.add('in-drawing-mode');
      } else {
        document
          .getElementById('container_pdf')
          .classList.remove('in-drawing-mode-parent');
        frames.contentWindow.document
          .getElementById('viewer')
          .classList.remove('in-drawing-mode');
      }
      return;
    }
    // tslint:disable-next-line:prefer-for-of
    if (state) {
      document
        .getElementById('container_pdf')
        .classList.add('in-drawing-mode-parent');
      frames.contentWindow.document
        .getElementById('viewer')
        .classList.add('in-drawing-mode');
    } else {
      document
        .getElementById('container_pdf')
        .classList.remove('in-drawing-mode-parent');
      frames.contentWindow.document
        .getElementById('viewer')
        .classList.remove('in-drawing-mode');
    }
  }

  addStylesToIframe(iframe): void {
    const style = document.createElement('style');
    style.innerHTML = `
      .in-drawing-mode {
        cursor : not-allowed
      }
      .in-drawing-mode .canvasWrapper {
        cursor: cell;
      }
    `;
    iframe.contentWindow.document.getElementsByTagName('body')[0].append(style);
  }

  // .......Open File Using PDFJS.................

  public openPdf(file): void {
    this.pdfViewerOnDemand.pdfSrc = file;
    this.pdfViewerOnDemand.refresh();
    const iframe = document.getElementsByTagName('iframe')[0];
    iframe.style.height = 'calc(100vh + 34px)';
    iframe.style.left = '0px';
    iframe.style.position = 'fixed';
    iframe.style.top = '-34px';
    const iframeLoaded = () => {
      iframe.contentWindow.document.getElementById(
        'viewerContainer'
      ).style.overflow = 'hidden';
      document.getElementById('root').style.overflow = 'hidden';
      if (!document.getElementById('pdf-top')) {
        return;
      }
      document.getElementById('hormenu').style.display = 'none';
      document.getElementById('pdf-top').style.display = 'none';
      (document.querySelector('.topbar') as any).style.display = 'none';
    };
    iframe.onload = iframeLoaded;
  }

  setUpPdf(): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    if (this.selectMode) {
      this.activateSelectTextListener();
      return;
    }
    iframe.contentWindow.document
      .querySelectorAll('.textLayer')
      .forEach((textLayer) => {
        (textLayer as any).style.pointerEvents = 'none';
      });
    iframe.contentWindow.document
      .querySelectorAll('.annotationLayer')
      .forEach((annotation) => {
        (annotation as any).style.pointerEvents = 'none';
      });
    this.activateListeners();
    this.checkPreviewMode();
    this.DataLoaded.emit({
      loaded: true,
      totalPageNumber: this.totalPageNumber,
    });
  }

  setWidthHeightIframe(iframe): void {
    const extraCorrectHeight =
      iframe.contentWindow.document.getElementById('toolbarContainer')
        .offsetHeight +
      iframe.contentWindow.document
        .querySelector('.page')
        .getBoundingClientRect().bottom -
      iframe.contentWindow.document
        .querySelector('.page')
        .getBoundingClientRect().height;
    document.getElementById('container_pdf').style.height =
      iframe.contentWindow.document.getElementById('viewer').offsetHeight +
      extraCorrectHeight +
      'px';
    if (
      screen.width >
      iframe.contentWindow.document.querySelector('.page').clientWidth
    ) {
      iframe.style.width = '100%';
      document.getElementById('container_pdf').style.overflowX = 'hidden';
      document.getElementById('container_pdf').style.width = '100%';
      this.nextCorrectWidth = 0;
    } else {
      const widthHolder =
        iframe.contentWindow.document.querySelector('.page').clientWidth;
      this.nextCorrectWidth =
        (iframe.contentWindow.document.querySelector('.page') as any)
          .offsetWidth -
        iframe.contentWindow.document.getElementById('viewer').offsetWidth;
      document.getElementById('container_pdf').style.width =
        widthHolder + this.nextCorrectWidth + 'px';
      this.getParentZoomingValue();
    }
  }

  // .......Handling Zooming Events.................

  getParentZoomingValue(): void {
    this.convertToHtml.zoomParentEvent.subscribe((zoomValue) => {
      this.prepareScalledIframeWithTools(zoomValue);
    });
  }

  prepareScalledIframeWithTools(zoomValue): void {
    const frame = document.getElementsByTagName('iframe')[0];
    if (!frame) {
      console.log('iframe not loaded');
      return;
    }
    if (zoomValue === 1) {
      this.scaleXY = 'none !important';
      document.getElementById('container_pdf').style.transform =
        'none !important';
      document.getElementById('container_pdf').style.position = 'unset';
      frame.contentWindow.document.querySelectorAll('.tool').forEach((tool) => {
        document.getElementById('container_pdf').appendChild(tool);
      });
      document.querySelectorAll('.tool').forEach((tool) => {
        (tool as any).style.pointerEvents = 'auto';
      });
      document.querySelectorAll('.edit-option').forEach((circle) => {
        (circle as any).style.display = 'inline-block';
      });
      document.getElementById('root').style.overflow = 'auto';
      frame.style.height = 'calc(100vh + 34px)';
      frame.contentWindow.document.getElementById(
        'viewerContainer'
      ).style.overflow = 'auto';
      if (
        screen.width >
        frame.contentWindow.document.querySelector('.page').clientWidth
      ) {
        frame.contentWindow.document.getElementById(
          'viewerContainer'
        ).style.marginBottom = '0%';
      } else {
        // frame.contentWindow.document.getElementById('viewerContainer').style.marginLeft = '0%';
        frame.contentWindow.document.getElementById(
          'viewerContainer'
        ).style.marginRight = '0%';
      }
      return;
    }
    const scaledIframe = document.getElementsByTagName('iframe')[0];
    setTimeout(() => {
      if (
        screen.width >
        frame.contentWindow.document.querySelector('.page').clientWidth
      ) {
        scaledIframe.contentWindow.document.getElementById(
          'viewerContainer'
        ).style.marginBottom = zoomValue * 10 + 3 + '%';
      } else {
        scaledIframe.contentWindow.document.getElementById(
          'viewerContainer'
        ).style.marginRight = '30%';
        scaledIframe.contentWindow.document.getElementById(
          'viewerContainer'
        ).style.marginRight = (zoomValue - 1.1) * 10 + 30 + '%';
      }
      document.querySelectorAll('.tool').forEach((tool) => {
        scaledIframe.contentWindow.document
          .getElementById('viewerContainer')
          .appendChild(tool);
      });
      setTimeout(() => {
        scaledIframe.contentWindow.document
          .querySelectorAll('.tool')
          .forEach((tool) => {
            (tool as any).style.position = 'absolute';
            (tool as any).style.pointerEvents = 'none';
            (tool as any).style.top = '0px';
            (tool as any).style.left = '0px';
          });
        scaledIframe.contentWindow.document
          .querySelectorAll('.drag-mask')
          .forEach((tool) => {
            (tool as any).style.top = '0px';
            (tool as any).style.height = '0px';
          });
        scaledIframe.contentWindow.document
          .querySelectorAll('.edit-option')
          .forEach((circle) => {
            (circle as any).style.display = 'none';
          });
      });
    });
    document.getElementById('container_pdf').style.position = 'fixed';
  }

  handleZooming(element): void {
    // Handle Iframe Zooming
    this.handleIframeZooming(element);
    // Handle Window Zooming
    this.handleWindowZooming();
  }

  handleIframeZooming(element): void {
    element.contentWindow.document.addEventListener(
      'wheel',
      (event) => {
        if (!this.pdfViewerOnDemand.PDFViewerApplication) {
          return;
        }
        if (event.ctrlKey && event.type === 'wheel') {
          this.wheelZooming(event);
        }
      },
      { passive: false }
    );
    element.contentWindow.document.addEventListener(
      'keydown',
      (event) => {
        if (!this.pdfViewerOnDemand.PDFViewerApplication) {
          return;
        }
        const eventCodes = ['NumpadAdd', 'NumpadSubtract', 'Equal', 'Minus'];
        const codeExist = eventCodes.findIndex((code) => code === event.code);
        if (event.ctrlKey && codeExist > -1) {
          this.equalMinusZooming(event);
        }
      },
      { passive: false }
    );
  }

  handleWindowZooming(): void {
    window.addEventListener(
      'wheel',
      (event) => {
        if (event.ctrlKey && event.type === 'wheel') {
          event.stopPropagation();
        }
      },
      { passive: false }
    );
    window.addEventListener(
      'keydown',
      (event) => {
        const eventCodes = ['NumpadAdd', 'NumpadSubtract', 'Equal', 'Minus'];
        const codeExist = eventCodes.findIndex((code) => code === event.code);
        if (event.ctrlKey && codeExist > -1) {
          event.stopPropagation();
        }
      },
      { passive: false }
    );
    /* window.addEventListener('wheel', event => {
      if (event.ctrlKey && event.type === 'wheel') {
        if (!this.pdfViewerOnDemand.PDFViewerApplication) {
          return;
        }
        this.wheelZooming(event);
      }
    }, { passive: false });
    window.addEventListener('keydown', (event) => {
      if (!this.pdfViewerOnDemand.PDFViewerApplication) {
        return;
      }
      const eventCodes = ['NumpadAdd', 'NumpadSubtract', 'Equal', 'Minus'];
      const codeExist = eventCodes.findIndex((code) => code === event.code);
      if (event.ctrlKey && (codeExist > -1)) {
        this.equalMinusZooming(event);
      }
    }, { passive: false }); */
  }

  checkMinusAdd(event): number {
    if (event.code === 'Equal' || event.code === 'NumpadAdd') {
      return 1;
    }

    if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
      return -1;
    }
  }

  equalMinusZooming(event): void {
    event.preventDefault();
    if (!this.pdfViewerOnDemand.PDFViewerApplication.pdfViewer) {
      return;
    }
    const direction = this.checkMinusAdd(event);
    const zoomValue = direction * 0.2;
    this.zoomHolder = zoomValue;
    this.convertToHtml.emitChildZoomEvent(zoomValue);
  }

  wheelZooming(event): void {
    event.preventDefault();
    if (!this.pdfViewerOnDemand.PDFViewerApplication.pdfViewer) {
      return;
    }
    this.pdfViewerOnDemand.PDFViewerApplication.pdfViewer._currentScaleValue =
      '100';
    const direction = Math.sign(event.deltaY);
    const zoomValue = direction * 0.2;
    this.zoomHolder = zoomValue;
    this.convertToHtml.emitChildZoomEvent(zoomValue);
  }

  // .......Change Pages.................

  checkPageNumber(): void {
    this.convertToHtml.pageNumberParent.subscribe((pageNumber) => {
      this.pdfViewerOnDemand.page = pageNumber.numb;
      this.specificPageToShow = pageNumber.specificPage;
      if (!this.specificPageToShow) {
        return;
      }
      setTimeout(() => {
        this.hideOtherPages(pageNumber.numb);
      });
    });
  }

  hideOtherPages(pageNumber): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    iframe.contentWindow.document
      .getElementById('viewer')
      .childNodes.forEach((page, index) => {
        if (pageNumber === index + 1) {
          return;
        }
        (page as any).style.display = 'none';
      });
  }

  testPageChange($event): void {
    this.currentPageNumber = $event;
    this.convertToHtml.emitChildNewPage(this.currentPageNumber);
  }

  // .......PDFJs Events.................

  getAllEventBusValues(): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    if (
      this.pdfViewerOnDemand.PDFViewerApplication.pdfViewer
        ._currentScaleValue !== '1'
    ) {
      this.pdfViewerOnDemand.PDFViewerApplication.pdfViewer._currentScaleValue =
        '100';
    }
    // disable PDFJs zoomIn/zoomOut/scaleChanged

    this.pdfViewerOnDemand.PDFViewerApplication.zoomIn = (ticks: any) => {};

    this.pdfViewerOnDemand.PDFViewerApplication.zoomOut = (ticks: any) => {};

    this.pdfViewerOnDemand.PDFViewerApplication.scaleChanged = (
      ticks: any
    ) => {};

    this.pdfViewerOnDemand.PDFViewerApplication.eventBus.on(
      'pagerendered',
      (e: any) => {
        this.checkPreviewMode();
        this.getParentZoomingValue();
        if (this.selectMode) {
          this.activateSelectTextListener();
          return;
        }
        iframe.contentWindow.document
          .querySelectorAll('.textLayer')
          .forEach((page) => {
            (page as any).style.pointerEvents = 'none';
          });
        iframe.contentWindow.document
          .querySelectorAll('.annotationLayer')
          .forEach((annotation) => {
            (annotation as any).style.pointerEvents = 'none';
          });
      }
    );
  }

  testPagesLoaded($event): void {
    const that = this;
    document.getElementById('container_pdf').style.height = '100vh';
    setTimeout(() => {
      const iframe = document.getElementsByTagName('iframe')[0];
      that.pageOffsetHeight =
        iframe.contentWindow.document.querySelector('.page').scrollHeight;
      iframe.contentWindow.document.getElementById(
        'viewerContainer'
      ).style.overflow = 'auto';
      document.getElementById('root').style.overflow = 'auto';
      this.loader = false;
      that.setWidthHeightIframe(iframe);
      (
        iframe.contentWindow.document.querySelector('.toolbar') as any
      ).style.display = 'none';
      that.activateScrollListener();
      that.totalPageNumber = $event;
      that.getAllEventBusValues();
      that.addStylesToIframe(iframe);
      that.handleIframeZooming(iframe);
      // that.handleZooming(iframe);
      that.setUpPdf();
    });
  }

  activateScrollListener(): void {
    const that = this;
    const frames = document.getElementsByTagName('iframe')[0];
    if (!frames) {
      return;
    }
    const x = `
    const scrollHandler = function(ev) {
      const eev = {
        ScrollTop: ev.target.scrollTop,
        ScrollLeft: ev.target.scrollLeft
      }
      window.parent.postMessage({action: 'scroll', e: eev}, "*");
    }
    document.getElementById('viewerContainer').addEventListener("scroll", scrollHandler);
    `;
    (frames.contentWindow as any).eval(x);
  }

  activateScrollListenerParent(): void {
    const that = this;
    const iframe = document.getElementsByTagName('iframe')[0];
    const scrollHandler = (ev) => {
      iframe.contentWindow.document
        .getElementById('viewerContainer')
        .scroll({ top: window.pageYOffset });
    };
    window.addEventListener('scroll', scrollHandler);
  }

  listeningEvents(): void {
    const iframe = document.getElementsByTagName('iframe')[0];
    window.addEventListener(
      'message',
      (event) => {
        if (event.data.type === 'webpackOk') {
          return;
        }
        if (event.data.action === 'scroll') {
          document.getElementById('root').scroll({
            top: event.data.e.ScrollTop,
            left: event.data.e.ScrollLeft,
          });
        }
      },
      false
    );
  }

  getSelectedFile(): void {
    if (this.selectedFile) {
      this.PDFJs = this.selectedFile;
    }
    this.loader = true;
    this.openPdf(this.PDFJs);
    if (
      this.mode === 'Drawing' ||
      this.mode === 'Preview'
    ) {
      this.selectMode = false;
      return;
    }
    this.selectMode = true;
  }

  getIframeEventsData(): void {
    this.toolManagement.getEventData().subscribe((res) => {
      this.eventData = res;
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.getSelectedFile();
    });
    this.getIframeEventsData();
    this.handleWindowZooming();
    this.listeningEvents();
    this.activateDrawing();
    this.checkPageNumber();
    this.currentPageNumber = 1;
  }

  ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.unsubscribe();
  }
}
