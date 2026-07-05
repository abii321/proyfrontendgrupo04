import { Component, ElementRef, ViewChild, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';

interface ChatMessage {
  text: string;
  sender: 'user' | 'bot';
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  isOpen = false;
  messages: ChatMessage[] = [];
  newMessage = '';
  isTyping = false;

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) { }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.messages.push({ text: 'Hola, ¿en qué te puedo ayudar?', sender: 'bot' });
    }
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMessage = this.newMessage;
    this.messages.push({ text: userMessage, sender: 'user' });
    this.newMessage = '';
    this.isTyping = true;

    this.chatService.sendMessage(userMessage).subscribe({
      next: (res) => {
        this.isTyping = false;
        if (res.status === 1) {
          this.messages.push({ text: res.data, sender: 'bot' });
        } else {
          this.messages.push({ text: 'Hubo un error al procesar tu mensaje.', sender: 'bot' });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isTyping = false;
        this.messages.push({ text: 'Error de conexión. Inténtalo más tarde.', sender: 'bot' });
        this.cdr.detectChanges();
      }
    });
  }
}
