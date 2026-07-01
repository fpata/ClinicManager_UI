import { TestBed } from '@angular/core/testing';
import { UtilityService } from './utility.service';

describe('UtilityService', () => {
  let service: UtilityService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UtilityService]
    });
    service = TestBed.inject(UtilityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('format', () => {
    it('should format date correctly with yyyy-MM-dd format', () => {
      const date = new Date(2026, 6, 1, 14, 30, 0); // July 1, 2026, 14:30:00
      expect(service.format(date, 'yyyy-MM-dd')).toBe('2026-07-01');
    });

    it('should format date correctly with MM/dd/yyyy format', () => {
      const date = new Date(2026, 6, 1, 14, 30, 0);
      expect(service.format(date, 'MM/dd/yyyy')).toBe('07/01/2026');
    });

    it('should format date correctly with dd/MM/yyyy format', () => {
      const date = new Date(2026, 6, 1, 14, 30, 0);
      expect(service.format(date, 'dd/MM/yyyy')).toBe('01/07/2026');
    });

    it('should format date correctly with dd-MMM-yyyy format', () => {
      const date = new Date(2026, 6, 1, 14, 30, 0);
      expect(service.format(date, 'dd-MMM-yyyy')).toBe('01-Jul-2026');
    });

    it('should format date correctly with long month name MMMM', () => {
      const date = new Date(2026, 6, 1, 14, 30, 0);
      expect(service.format(date, 'dd-MMMM-yyyy')).toBe('01-July-2026');
    });

    it('should format date correctly with hours and am/pm', () => {
      const date = new Date(2026, 6, 1, 14, 30, 15);
      expect(service.format(date, 'yyyy-MM-dd hh:mm:ss tt')).toBe('2026-07-01 02:30:15 PM');
    });
  });
});
