import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef, NgZone } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';

import { Message, MessageType } from '../../models/message.model';
import { MessageService } from '../../services/message.service';
import { CommonModule } from '@angular/common';

@Component({ 
  selector: 'app-messages', 
  templateUrl: 'messages.component.html', 
  styleUrls: ['messages.component.css'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent implements OnInit, OnDestroy {
    @Input() id = 1;
    
    messages: Message[] = [];
    messageSubscription: Subscription;
    routeSubscription: Subscription;

    constructor(private router: Router, private messageService: MessageService, private cdRef: ChangeDetectorRef, private ngZone: NgZone) { }

    ngOnInit() {
        this.messageSubscription = this.messageService.onMessage(this.id)
            .subscribe(message => {
                this.ngZone.run(() => {
                    if (!message.message) {
                        this.messages = this.messages.filter(x => x.keepAfterRouteChange);
                        this.messages.forEach(x => delete x.keepAfterRouteChange);
                        this.cdRef.markForCheck();
                        return;
                    }

                    this.messages.push(message);
                    this.cdRef.markForCheck();

                    if (message.autoClose) {
                        const timeout = message.autoCloseTimeout || 500;
                        setTimeout(() => this.removeMessage(message), timeout);
                    }
                });
           });

        this.routeSubscription = this.router.events.subscribe(event => {
            if (event instanceof NavigationStart) {
                this.messageService.clear(this.id);
            }
        });
    }

    ngOnDestroy() {
        this.messageSubscription?.unsubscribe();
        this.routeSubscription?.unsubscribe();
    }

    removeMessage(message: Message) {
        if (!this.messages.includes(message)) return;
        
        this.ngZone.run(() => {
            this.messages = this.messages.filter(x => x !== message);
            this.cdRef.markForCheck();
        });
    }

    cssClass(message: Message) {
        if (!message) return 0;

        const classes = ['alert', 'alert-dismissable'];
                
        const messageTypeClass = {
            [MessageType.Success]: 'alert-success',
            [MessageType.Error]: 'alert-danger',
            [MessageType.Info]: 'alert-info',
            [MessageType.Warning]: 'alert-warning'
        }

        classes.push(messageTypeClass[message.type]);

        return classes.join(' ');
    }
}
