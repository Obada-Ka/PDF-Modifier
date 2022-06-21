import { TestBed } from '@angular/core/testing';

import { HtmlEventsService } from './html-events.service';

describe('HtmlEventsService', () => {
  let service: HtmlEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HtmlEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
