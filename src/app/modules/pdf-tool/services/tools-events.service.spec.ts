import { TestBed } from '@angular/core/testing';

import { ToolsEventsService } from './tools-events.service';

describe('ToolsEventsService', () => {
  let service: ToolsEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToolsEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
