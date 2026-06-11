import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, NavigationStart } from '@angular/router';
import { Subject, of } from 'rxjs';

import { MessagesComponent } from './messages.component';
import { MessageService } from '../../services/message.service';
import { Message, MessageType } from '../../models/message.model';

describe('MessagesComponent', () => {
  let component: MessagesComponent;
  let fixture: ComponentFixture<MessagesComponent>;
  let messageService: jasmine.SpyObj<MessageService>;
  let router: jasmine.SpyObj<Router>;
  let messageSubject: Subject<Message>;
  let routerEventsSubject: Subject<any>;
  let mockMessages: Message[];

  beforeEach(async () => {
    mockMessages = [
      {
        id: 1,
        message: 'Success message',
        type: MessageType.Success,
        autoClose: false,
        keepAfterRouteChange: false,
        fade: false
      },
      {
        id: 1,
        message: 'Error message',
        type: MessageType.Error,
        autoClose: true,
        autoCloseTimeout: 3000,
        keepAfterRouteChange: false,
        fade: false
      },
      {
        id: 1,
        message: 'Warning message',
        type: MessageType.Warning,
        autoClose: false,
        keepAfterRouteChange: true,
        fade: false
      },
      {
        id: 1,
        message: 'Info message',
        type: MessageType.Info,
        autoClose: true,
        autoCloseTimeout: 5000,
        keepAfterRouteChange: false,
        fade: false
      }
    ];

    messageSubject = new Subject<Message>();
    routerEventsSubject = new Subject<any>();

    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['onMessage', 'clear']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    messageServiceSpy.onMessage.and.returnValue(messageSubject.asObservable());
    routerSpy.events = routerEventsSubject.asObservable();

    await TestBed.configureTestingModule({
      imports: [MessagesComponent],
      providers: [
        { provide: MessageService, useValue: messageServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessagesComponent);
    component = fixture.componentInstance;
    messageService = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    messageSubject.complete();
    routerEventsSubject.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default id of 1', () => {
    expect(component.id).toBe(1);
    expect(component.messages).toEqual([]);
  });

  it('should allow custom id input', () => {
    component.id = 5;
    fixture.detectChanges();
    expect(component.id).toBe(5);
  });

  describe('Message Subscription', () => {
    beforeEach(() => {
      fixture.detectChanges(); // This calls ngOnInit
    });

    it('should subscribe to message service on init', () => {
      expect(messageService.onMessage).toHaveBeenCalledWith(component.id);
    });

    it('should add message to messages array', () => {
      messageSubject.next(mockMessages[0]);
      
      expect(component.messages).toContain(mockMessages[0]);
      expect(component.messages.length).toBe(1);
    });

    it('should add multiple messages', () => {
      messageSubject.next(mockMessages[0]);
      messageSubject.next(mockMessages[1]);
      
      expect(component.messages.length).toBe(2);
      expect(component.messages).toContain(mockMessages[0]);
      expect(component.messages).toContain(mockMessages[1]);
    });

    it('should handle empty message (clear operation)', () => {
      // Add messages first
      messageSubject.next(mockMessages[0]);
      messageSubject.next(mockMessages[2]); // keepAfterRouteChange: true
      
      // Send empty message
      messageSubject.next({ message: '' } as Message);
      
      expect(component.messages.length).toBe(1);
      const expectedMessage = { ...mockMessages[2] };
      delete expectedMessage.keepAfterRouteChange;
      expect(component.messages[0]).toEqual(expectedMessage);
    });
  });

  describe('Auto Close Messages', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should auto close message with default timeout', fakeAsync(() => {
      const autoCloseMessage: any = { ...mockMessages[1], autoCloseTimeout: undefined };
      messageSubject.next(autoCloseMessage);
      
      expect(component.messages).toContain(autoCloseMessage);
      
      tick(3000); // Default timeout
      tick(250); // Animation delay
      
      expect(component.messages).not.toContain(autoCloseMessage);
    }));

    it('should auto close message with custom timeout', fakeAsync(() => {
      messageSubject.next(mockMessages[3]); // 5000ms timeout
      
      expect(component.messages).toContain(mockMessages[3]);
      
      tick(5000);
      tick(250);
      
      expect(component.messages).not.toContain(mockMessages[3]);
    }));

    it('should not auto close message when autoClose is false', fakeAsync(() => {
      messageSubject.next(mockMessages[0]); // autoClose: false
      
      expect(component.messages).toContain(mockMessages[0]);
      
      tick(5000);
      
      expect(component.messages).toContain(mockMessages[0]);
    }));
  });

  describe('Router Events', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should clear messages on navigation start', () => {
      routerEventsSubject.next(new NavigationStart(1, '/test'));
      
      expect(messageService.clear).toHaveBeenCalledWith(component.id);
    });

    it('should not clear messages on other router events', () => {
      routerEventsSubject.next({ type: 'other' });
      
      expect(messageService.clear).not.toHaveBeenCalled();
    });
  });

  describe('Remove Message', () => {
    beforeEach(() => {
      fixture.detectChanges();
      messageSubject.next(mockMessages[0]);
      messageSubject.next(mockMessages[1]);
    });

    it('should remove specific message', fakeAsync(() => {
      component.removeMessage(mockMessages[0]);
      
      tick(250);
      
      expect(component.messages).not.toContain(mockMessages[0]);
      expect(component.messages).toContain(mockMessages[1]);
    }));

    it('should not remove message that is not in array', () => {
      const originalLength = component.messages.length;
      component.removeMessage(mockMessages[2]);
      
      expect(component.messages.length).toBe(originalLength);
    });

    it('should handle removing undefined message', () => {
      expect(() => component.removeMessage(undefined as any)).not.toThrow();
    });
  });

  describe('CSS Classes', () => {
    it('should return correct CSS class for success message', () => {
      const cssClass = component.cssClass(mockMessages[0]);
      expect(cssClass).toContain('alert alert-dismissable alert-success');
    });

    it('should return correct CSS class for error message', () => {
      const cssClass = component.cssClass(mockMessages[1]);
      expect(cssClass).toContain('alert alert-dismissable alert-danger');
    });

    it('should return correct CSS class for warning message', () => {
      const cssClass = component.cssClass(mockMessages[2]);
      expect(cssClass).toContain('alert alert-dismissable alert-warning');
    });

    it('should return correct CSS class for info message', () => {
      const cssClass = component.cssClass(mockMessages[3]);
      expect(cssClass).toContain('alert alert-dismissable alert-info');
    });

    it('should handle undefined message', () => {
      const cssClass = component.cssClass(undefined as any);
      expect(cssClass).toBe(0);
    });

    it('should handle null message', () => {
      const cssClass = component.cssClass(null as any);
      expect(cssClass).toBe(0);
    });
  });

  describe('Component Lifecycle', () => {
    it('should unsubscribe on destroy', () => {
      fixture.detectChanges();
      
      spyOn(component.messageSubscription, 'unsubscribe');
      spyOn(component.routeSubscription, 'unsubscribe');
      
      component.ngOnDestroy();
      
      expect(component.messageSubscription.unsubscribe).toHaveBeenCalled();
      expect(component.routeSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should handle complete message lifecycle', fakeAsync(() => {
      // Add message
      messageSubject.next(mockMessages[1]); // Auto close message
      expect(component.messages.length).toBe(1);
      
      // Message should auto close
      tick(3000);
      tick(250);
      expect(component.messages.length).toBe(0);
      
      // Add persistent message
      messageSubject.next(mockMessages[0]); // No auto close
      expect(component.messages.length).toBe(1);
      
      // Manually remove message
      component.removeMessage(mockMessages[0]);
      tick(250);
      expect(component.messages.length).toBe(0);
    }));

    it('should handle route change with keepAfterRouteChange messages', () => {
      // Add messages
      messageSubject.next(mockMessages[0]); // keepAfterRouteChange: false
      messageSubject.next(mockMessages[2]); // keepAfterRouteChange: true
      
      // Clear messages (simulating route change)
      messageSubject.next({ message: '' } as Message);
      
      expect(component.messages.length).toBe(1);
      expect(component.messages[0].message).toBe('Warning message');
      expect(component.messages[0].keepAfterRouteChange).toBeUndefined();
    });
  });
});
