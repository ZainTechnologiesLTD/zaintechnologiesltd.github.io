/**
 * ZainBot - Intelligent Chatbot for Zain Technologies
 * Features: FAQ responses, lead capture, service recommendations
 */

class ZainBot {
  constructor() {
    this.isOpen = false;
    this.conversationId = this.generateId();
    this.messages = [];
    this.userProfile = this.loadUserProfile();
    this.knowledgeBase = this.initKnowledgeBase();
    this.db = null;
    this.dbEnabled = false;
    
    this.init();
  }

  init() {
    this.createChatWidget();
    this.setupEventListeners();
    this.loadChatHistory();
    this.initDatabase();
    
    // Wait for ZainDB to initialize
    this.waitForDatabase();
  }

  async waitForDatabase() {
    const maxWait = 10000; // 10 seconds
    const startTime = Date.now();
    
    const checkDB = () => {
      if (window.zainDB && window.zainDB.isReady()) {
        console.log('ZainDB ready, chatbot database integration enabled');
        this.dbEnabled = true;
        this.integrateWithZainDB();
        return;
      }
      
      if (Date.now() - startTime < maxWait) {
        setTimeout(checkDB, 100);
      } else {
        console.warn('ZainDB not available, chatbot will use localStorage only');
        this.dbEnabled = false;
      }
    };
    
    checkDB();
  }

  async integrateWithZainDB() {
    if (!this.dbEnabled || !window.zainDB) return;

    try {
      // Create conversation in ZainDB
      await window.zainDB.saveConversation({
        id: this.conversationId,
        userId: this.getUserId(),
        sessionId: this.getSessionId(),
        status: 'active'
      });

      // Load existing messages from ZainDB
      const existingMessages = await window.zainDB.getChatHistory(this.conversationId);
      if (existingMessages.length > 0) {
        this.messages = existingMessages.map(msg => ({
          id: msg.id,
          conversationId: msg.conversation_id,
          sender: msg.sender,
          text: msg.message,
          timestamp: msg.created_at,
          intent: msg.intent,
          confidence: msg.confidence
        }));
        this.renderChatHistory();
      }

      console.log('ZainDB integration completed');
    } catch (error) {
      console.error('ZainDB integration failed:', error);
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  initKnowledgeBase() {
    return {
      greetings: [
        "Hello! I'm ZainBot, your AI assistant from Zain Technologies. How can I help you today?",
        "Hi there! Welcome to Zain Technologies. I'm here to help you learn about our services and solutions.",
        "Greetings! I'm ZainBot, ready to assist you with information about our digital transformation services."
      ],
      services: {
        "digital product": {
          response: "We specialize in digital product development including web applications, mobile apps, and SaaS platforms. Our team delivers scalable solutions using modern technologies like React, Node.js, and cloud infrastructure. What type of digital product are you interested in?",
          followup: ["web application", "mobile app", "saas platform", "e-commerce"]
        },
        "ai analytics": {
          response: "We provide AI-powered analytics including predictive modeling, machine learning solutions, and data visualization dashboards. Our team specializes in healthcare analytics and business intelligence. What type of AI solution are you interested in?",
          followup: ["machine learning", "healthcare ai", "business intelligence", "data science"]
        },
        "infrastructure": {
          response: "Our infrastructure services include cloud migration, cybersecurity, DevOps automation, and managed services with 24/7 monitoring. We ensure 99.9% uptime. Are you looking for cloud migration or security services?",
          followup: ["cloud migration", "cybersecurity", "devops", "managed services"]
        },
        "healthcare": {
          response: "ZAIN HMS is our flagship hospital management system serving 18+ healthcare facilities. It includes patient management, billing, pharmacy, laboratory, and analytics modules. Would you like a demo or pricing information?",
          followup: ["demo", "pricing", "features", "implementation"]
        }
      },
      faqs: {
        "pricing": "Our pricing varies by project scope and complexity. Most projects range from $50k-$1M. We offer flexible payment terms and ROI-focused solutions. Shall I connect you with our sales team for a detailed quote?",
        "timeline": "Typical project timelines range from 3-12 months depending on complexity. We use agile methodology with 2-week sprints and regular updates. Would you like to discuss your specific timeline requirements?",
        "support": "We provide 24/7 technical support, dedicated account management, and comprehensive training programs. All our solutions include ongoing maintenance and updates. What type of support are you most interested in?",
        "security": "We implement enterprise-grade security including end-to-end encryption, SOC 2 compliance, regular audits, and HIPAA compliance for healthcare clients. Security is embedded in every layer of our solutions.",
        "integration": "We specialize in system integration with APIs, HL7/FHIR for healthcare, ERP systems, and legacy platform modernization. Our integration approach ensures seamless data flow and system reliability."
      },
      industries: {
        "healthcare": "We serve hospitals, clinics, and healthcare networks with specialized solutions including EMR, telemedicine, and compliance management.",
        "government": "Our public sector solutions include smart city platforms, digital identity systems, and citizen service portals with security focus.",
        "finance": "We provide fintech solutions, secure payment gateways, and regulatory compliance systems for financial institutions.",
        "education": "Our education solutions include learning management systems, virtual labs, and administrative automation."
      }
    };
  }

  async initDatabase() {
    try {
      // Initialize IndexedDB for chat storage
      this.db = await this.openDatabase();
      this.loadMessagesFromDB();
    } catch (error) {
      console.warn('Database initialization failed, using localStorage fallback:', error);
      this.loadMessagesFromStorage();
    }
  }

  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ZainBotDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
          messagesStore.createIndex('conversationId', 'conversationId', { unique: false });
          messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // User profiles store
        if (!db.objectStoreNames.contains('profiles')) {
          db.createObjectStore('profiles', { keyPath: 'id' });
        }
        
        // Analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('event', 'event', { unique: false });
          analyticsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  createChatWidget() {
    const chatWidget = document.createElement('div');
    chatWidget.className = 'zainbot-widget';
    chatWidget.innerHTML = `
      <div class="zainbot-toggle" id="zainbot-toggle">
        <div class="zainbot-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="zainbot-badge" id="zainbot-badge">1</div>
      </div>
      
      <div class="zainbot-chat" id="zainbot-chat">
        <div class="zainbot-header">
          <div class="zainbot-header-info">
            <div class="zainbot-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.1 3.89 23 5 23H19C20.1 23 21 22.1 21 21V9H21Z" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <div class="zainbot-name">ZainBot</div>
              <div class="zainbot-status">
                <span class="zainbot-status-dot"></span>
                Online
              </div>
            </div>
          </div>
          <button class="zainbot-close" id="zainbot-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="zainbot-messages" id="zainbot-messages">
          <div class="zainbot-message zainbot-message--bot">
            <div class="zainbot-message-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
              </svg>
            </div>
            <div class="zainbot-message-content">
              <div class="zainbot-message-text">
                Hello! I'm ZainBot, your AI assistant. I can help you learn about our digital transformation services, get pricing information, or connect you with our team. What would you like to know?
              </div>
              <div class="zainbot-message-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>
        
        <div class="zainbot-quick-actions" id="zainbot-quick-actions">
          <button class="zainbot-quick-btn" data-action="services">Our Services</button>
          <button class="zainbot-quick-btn" data-action="pricing">Pricing</button>
          <button class="zainbot-quick-btn" data-action="demo">Request Demo</button>
          <button class="zainbot-quick-btn" data-action="contact">Contact Us</button>
        </div>
        
        <div class="zainbot-input-area">
          <div class="zainbot-input-container">
            <input 
              type="text" 
              id="zainbot-input" 
              placeholder="Ask me anything about our services..."
              maxlength="500"
            />
            <button class="zainbot-send" id="zainbot-send">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="zainbot-typing" id="zainbot-typing">
            <span></span><span></span><span></span>
          </div>
        </div>
        
        <div class="zainbot-footer">
          <div class="zainbot-powered">
            Powered by <strong>Zain Technologies AI</strong>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(chatWidget);
  }

  setupEventListeners() {
    const toggle = document.getElementById('zainbot-toggle');
    const close = document.getElementById('zainbot-close');
    const input = document.getElementById('zainbot-input');
    const send = document.getElementById('zainbot-send');
    const quickActions = document.getElementById('zainbot-quick-actions');

    toggle.addEventListener('click', () => this.toggleChat());
    close.addEventListener('click', () => this.closeChat());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    send.addEventListener('click', () => this.sendMessage());
    
    quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('zainbot-quick-btn')) {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      }
    });

    // Auto-show chat after 30 seconds if no interaction
    setTimeout(() => {
      if (!this.isOpen && !localStorage.getItem('zainbot-interacted')) {
        this.showNotification();
      }
    }, 30000);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chat = document.getElementById('zainbot-chat');
    const badge = document.getElementById('zainbot-badge');
    
    if (this.isOpen) {
      chat.classList.add('zainbot-chat--open');
      badge.style.display = 'none';
      document.getElementById('zainbot-input').focus();
      
      // Track opening
      this.trackEvent('chat_opened');
      localStorage.setItem('zainbot-interacted', 'true');
    } else {
      chat.classList.remove('zainbot-chat--open');
    }
  }

  closeChat() {
    this.isOpen = false;
    const chat = document.getElementById('zainbot-chat');
    chat.classList.remove('zainbot-chat--open');
    
    this.trackEvent('chat_closed');
  }

  showNotification() {
    const badge = document.getElementById('zainbot-badge');
    badge.style.display = 'flex';
    badge.textContent = '!';
    
    // Pulse animation
    const toggle = document.getElementById('zainbot-toggle');
    toggle.style.animation = 'pulse 1s ease-in-out 3';
    
    setTimeout(() => {
      toggle.style.animation = '';
    }, 3000);
  }

  async sendMessage() {
    const input = document.getElementById('zainbot-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    // Add user message
    this.addMessage('user', text);
    input.value = '';
    
    // Show typing indicator
    this.showTyping();
    
    // Track message
    this.trackEvent('message_sent', { text, sender: 'user' });
    
    // Generate response
    setTimeout(async () => {
      const response = await this.generateResponse(text);
      this.hideTyping();
      this.addMessage('bot', response.text, response.actions);
    }, 1000 + Math.random() * 2000);
  }

  async generateResponse(text) {
    const intent = this.recognizeIntent(text);
    
    switch (intent.type) {
      case 'greeting':
        return {
          text: this.getRandomResponse(this.knowledgeBase.greetings),
          actions: ['services', 'pricing', 'demo']
        };
        
      case 'service':
        const service = this.knowledgeBase.services[intent.service];
        return {
          text: service.response,
          actions: service.followup
        };
        
      case 'faq':
        return {
          text: this.knowledgeBase.faqs[intent.topic],
          actions: ['contact', 'demo']
        };
        
      case 'contact':
        return {
          text: "I'd be happy to connect you with our team! You can:\n\n• Fill out our contact form\n• Email us at hello@zain-technologies.com\n• Schedule a discovery call\n\nWhat works best for you?",
          actions: ['contact_form', 'email', 'schedule_call']
        };
        
      case 'demo':
        return {
          text: "Great! I can help you request a demo. What type of solution are you most interested in?\n\n• ZAIN HMS (Healthcare)\n• AI & Analytics Platform\n• Infrastructure Solutions\n• Custom Development",
          actions: ['hms_demo', 'ai_demo', 'infra_demo', 'custom_demo']
        };
        
      default:
        return {
          text: "I understand you're asking about: \"" + text + "\"\n\nI'd recommend connecting with our team for detailed information. They can provide specific answers about our services, pricing, and how we can help with your project.",
          actions: ['contact', 'services', 'schedule_call']
        };
    }
  }

  recognizeIntent(text) {
    const lowercaseText = text.toLowerCase();
    
    // Calculate confidence based on keyword matches
    let confidence = 0.5; // Base confidence
    
    // Greeting patterns
    if (/hello|hi|hey|greetings|good (morning|afternoon|evening)/.test(lowercaseText)) {
      confidence = 0.9;
      return { type: 'greeting', confidence };
    }
    
    // Service-related patterns
    if (/digital|web|app|software|development|website|mobile/.test(lowercaseText)) {
      confidence = 0.8;
      return { type: 'service', service: 'digital product', confidence };
    }
    
    if (/ai|analytics|machine learning|data|artificial intelligence|ml/.test(lowercaseText)) {
      confidence = 0.8;
      return { type: 'service', service: 'ai analytics', confidence };
    }
    
    if (/infrastructure|cloud|security|devops|cyber|server|hosting/.test(lowercaseText)) {
      confidence = 0.8;
      return { type: 'service', service: 'infrastructure', confidence };
    }
    
    if (/hospital|healthcare|hms|medical|clinic|patient/.test(lowercaseText)) {
      confidence = 0.9;
      return { type: 'service', service: 'healthcare', confidence };
    }
    
    // FAQ patterns
    if (/price|pricing|cost|budget|how much|expense/.test(lowercaseText)) {
      confidence = 0.8;
      return { type: 'faq', topic: 'pricing', confidence };
    }
    
    if (/timeline|time|duration|how long|when|schedule/.test(lowercaseText)) {
      confidence = 0.7;
      return { type: 'faq', topic: 'timeline', confidence };
    }
    
    if (/support|help|assistance|maintain|maintenance/.test(lowercaseText)) {
      confidence = 0.7;
      return { type: 'faq', topic: 'support', confidence };
    }
    
    if (/security|secure|safety|protection|privacy/.test(lowercaseText)) {
      confidence = 0.8;
      return { type: 'faq', topic: 'security', confidence };
    }
    
    if (/integration|integrate|connect|api|interface/.test(lowercaseText)) {
      confidence = 0.7;
      return { type: 'faq', topic: 'integration', confidence };
    }
    
    // Action patterns
    if (/contact|reach|talk|speak|call|email/.test(lowercaseText)) {
      confidence = 0.8;
      return { type: 'contact', confidence };
    }
    
    if (/demo|demonstration|show|example|preview|trial/.test(lowercaseText)) {
      confidence = 0.8;
      return { type: 'demo', confidence };
    }
    
    return { type: 'general', confidence: 0.3 };
  }

  handleQuickAction(action) {
    const responses = {
      services: "We offer four main service areas:\n\n🔹 Digital Product Development\n🔹 AI & Advanced Analytics\n🔹 Infrastructure & Cybersecurity\n🔹 Consulting & Managed Services\n\nWhich area interests you most?",
      pricing: "Our pricing is project-based and depends on scope and complexity. Most engagements range from $50K to $1M+. We offer flexible payment terms and focus on ROI. Would you like a custom quote?",
      demo: "I'd love to show you our solutions in action! What would you like to see?\n\n• ZAIN HMS Healthcare Platform\n• AI Analytics Dashboard\n• Infrastructure Monitoring\n• Custom Application Demo",
      contact: "Ready to discuss your project? Here are the best ways to reach our team:\n\n📧 hello@zain-technologies.com\n📞 Schedule a discovery call\n📝 Fill out our contact form\n\nWhat works best for you?"
    };

    this.addMessage('user', `Tell me about ${action}`);
    
    setTimeout(() => {
      this.addMessage('bot', responses[action], ['contact_form', 'schedule_call']);
    }, 1000);
  }

  addMessage(sender, text, actions = []) {
    const messagesContainer = document.getElementById('zainbot-messages');
    const messageId = this.generateId();
    
    const messageElement = document.createElement('div');
    messageElement.className = `zainbot-message zainbot-message--${sender}`;
    messageElement.dataset.messageId = messageId;
    
    const timestamp = new Date();
    
    if (sender === 'bot') {
      messageElement.innerHTML = `
        <div class="zainbot-message-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
          </svg>
        </div>
        <div class="zainbot-message-content">
          <div class="zainbot-message-text">${this.formatMessage(text)}</div>
          ${actions.length > 0 ? this.createActionButtons(actions) : ''}
          <div class="zainbot-message-time">${this.formatTime(timestamp)}</div>
        </div>
      `;
    } else {
      messageElement.innerHTML = `
        <div class="zainbot-message-content">
          <div class="zainbot-message-text">${this.formatMessage(text)}</div>
          <div class="zainbot-message-time">${this.formatTime(timestamp)}</div>
        </div>
      `;
    }

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store message
    const message = {
      id: messageId,
      conversationId: this.conversationId,
      sender,
      text,
      timestamp: timestamp.toISOString(),
      actions
    };

    this.messages.push(message);
    this.saveMessage(message);
    
    // Track analytics
    this.trackEvent('message_sent', { sender, hasActions: actions.length > 0 });
  }

  createActionButtons(actions) {
    const actionMap = {
      contact_form: 'Contact Form',
      schedule_call: 'Schedule Call',
      email: 'Send Email',
      hms_demo: 'ZAIN HMS Demo',
      ai_demo: 'AI Platform Demo',
      infra_demo: 'Infrastructure Demo',
      custom_demo: 'Custom Demo'
    };

    const buttons = actions.map(action => 
      `<button class="zainbot-action-btn" data-action="${action}">
        ${actionMap[action] || action}
      </button>`
    ).join('');

    return `<div class="zainbot-actions">${buttons}</div>`;
  }

  formatMessage(text) {
    return text
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  showTyping() {
    document.getElementById('zainbot-typing').style.display = 'block';
  }

  hideTyping() {
    document.getElementById('zainbot-typing').style.display = 'none';
  }

  getRandomResponse(responses) {
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Database operations
  async saveMessage(message) {
    try {
      // Save to ZainDB if available
      if (this.dbEnabled && window.zainDB) {
        const intent = this.recognizeIntent(message.text);
        await window.zainDB.saveChatMessage({
          id: message.id,
          conversationId: message.conversationId,
          sender: message.sender,
          message: message.text,
          intent: intent.type,
          confidence: intent.confidence || null,
          metadata: {
            timestamp: message.timestamp,
            actions: message.actions || []
          }
        });
      }
      
      // Also save to IndexedDB if available
      if (this.db) {
        const transaction = this.db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        await store.add(message);
      } else {
        // Fallback to localStorage
        const messages = JSON.parse(localStorage.getItem('zainbot-messages') || '[]');
        messages.push(message);
        localStorage.setItem('zainbot-messages', JSON.stringify(messages));
      }
    } catch (error) {
      console.warn('Failed to save message:', error);
    }
  }

  async loadMessagesFromDB() {
    try {
      const transaction = this.db.transaction(['messages'], 'readonly');
      const store = transaction.objectStore('messages');
      const index = store.index('conversationId');
      const request = index.getAll(this.conversationId);
      
      request.onsuccess = () => {
        this.messages = request.result || [];
      };
    } catch (error) {
      console.warn('Failed to load messages from DB:', error);
    }
  }

  loadMessagesFromStorage() {
    const messages = JSON.parse(localStorage.getItem('zainbot-messages') || '[]');
    this.messages = messages.filter(m => m.conversationId === this.conversationId);
  }

  loadChatHistory() {
    // Load recent conversation from localStorage
    const messages = JSON.parse(localStorage.getItem('zainbot-messages') || '[]');
    this.messages = messages.filter(m => m.conversationId === this.conversationId);
    this.renderChatHistory();
  }

  renderChatHistory() {
    const messagesContainer = document.getElementById('zainbot-messages');
    if (!messagesContainer) return;

    // Clear existing messages except welcome message
    const welcomeMsg = messagesContainer.querySelector('.zainbot-message--bot');
    messagesContainer.innerHTML = '';
    if (welcomeMsg) {
      messagesContainer.appendChild(welcomeMsg);
    }

    // Render recent messages (last 10)
    const recentMessages = this.messages.slice(-10);
    recentMessages.forEach(message => {
      this.renderMessage(message);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  renderMessage(message) {
    const messagesContainer = document.getElementById('zainbot-messages');
    const messageElement = document.createElement('div');
    messageElement.className = `zainbot-message zainbot-message--${message.sender}`;
    messageElement.dataset.messageId = message.id;
    
    const timestamp = new Date(message.timestamp);
    
    if (message.sender === 'bot') {
      messageElement.innerHTML = `
        <div class="zainbot-message-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
          </svg>
        </div>
        <div class="zainbot-message-content">
          <div class="zainbot-message-text">${this.formatMessage(message.text)}</div>
          ${message.actions && message.actions.length > 0 ? this.createActionButtons(message.actions) : ''}
          <div class="zainbot-message-time">${this.formatTime(timestamp)}</div>
        </div>
      `;
    } else {
      messageElement.innerHTML = `
        <div class="zainbot-message-content">
          <div class="zainbot-message-text">${this.formatMessage(message.text)}</div>
          <div class="zainbot-message-time">${this.formatTime(timestamp)}</div>
        </div>
      `;
    }

    messagesContainer.appendChild(messageElement);
  }

  loadUserProfile() {
    return JSON.parse(localStorage.getItem('zainbot-profile') || '{}');
  }

  trackEvent(event, data = {}) {
    const eventData = {
      id: this.generateId(),
      event,
      data: {
        ...data,
        conversationId: this.conversationId,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    };

    // Store in ZainDB if available
    if (this.dbEnabled && window.zainDB) {
      window.zainDB.trackEvent({
        id: eventData.id,
        sessionId: this.getSessionId(),
        type: event,
        category: 'chatbot',
        action: event,
        label: data.label || null,
        value: data.value || null,
        pageUrl: window.location.href,
        userProperties: data
      });
    }

    // Store analytics event in IndexedDB
    if (this.db) {
      try {
        const transaction = this.db.transaction(['analytics'], 'readwrite');
        const store = transaction.objectStore('analytics');
        store.add(eventData);
      } catch (error) {
        console.warn('Failed to store analytics:', error);
      }
    }

    // Send to external analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', event, data);
    }
  }

  getUserId() {
    let userId = localStorage.getItem('zainbot-user-id');
    if (!userId) {
      userId = this.generateId();
      localStorage.setItem('zainbot-user-id', userId);
    }
    return userId;
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('zainbot-session-id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('zainbot-session-id', sessionId);
    }
    return sessionId;
  }
}

// Initialize ZainBot when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.zainBot = new ZainBot();
  });
} else {
  window.zainBot = new ZainBot();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZainBot;
}