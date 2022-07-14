import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from '../../services/global.service';

@Component({
  selector: 'app-pdf-upload',
  templateUrl: './pdf-upload.component.html',
  styleUrls: ['./pdf-upload.component.css']
})
export class PdfUploadComponent implements OnInit {
  selectedFile: any;
  fileName = 'Select your file!';
  drawOptions = [
    { key: 'draw_rectangle', label: 'Draw Rectangles', mode: 'Drawing' },
    { key: 'draw_line', label: 'Draw Lines', mode: 'Drawing' },
    { key: 'draw_point', label: 'Draw Points', mode: 'Drawing' },
    { key: 'select_text', label: 'Highlight Texts', mode: 'Highlight' }
  ];
  configuration = {
    tool: null,
    file: null
  };
  constructor(private globalService: GlobalService, private route: Router) { }
  ngOnInit(): void {
  }

  onFileChanged(event: any): void {
    const file = event.target.files[0];
    this.configuration.file = file;
    this.fileName = file.name;
    if (!this.selectedFile) {
      return;
    }
    event.target.value = '';
  }

  openPdfTool(): void {
    this.globalService.CONFIG_DRAW = this.configuration;
    this.route.navigate(['/pdf-tool']);
  }

}
