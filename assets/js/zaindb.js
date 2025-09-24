/**
 * ZainDB - Client-side SQLite Database Manager
 * Uses sql.js for WebAssembly SQLite functionality
 */

class ZainDB {
  constructor() {
    this.db = null;
    this.isInitialized = false;
    this.sqlWorker = null;
    this.dbName = 'zain_technologies.db';
    
    this.init();
  }

  async init() {
    try {
      // Load sql.js library
      await this.loadSQLJS();
      
      // Initialize database
      await this.initDatabase();
      
      // Setup periodic sync
      this.setupPeriodicSync();
      
      console.log('ZainDB initialized successfully');
    } catch (error) {
      console.error('ZainDB initialization failed:', error);
      this.fallbackToIndexedDB();
    }
  }

  async loadSQLJS() {
    return new Promise((resolve, reject) => {
      // Check if sql.js is already loaded
      if (window.SQL) {
        resolve(window.SQL);
        return;
      }

      // Create script element to load sql.js from CDN
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
      script.onload = async () => {
        try {
          // Initialize SQL.js
          const SQL = await window.initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
          });
          resolve(SQL);
        } catch (error) {
          reject(error);
        }
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async initDatabase() {
    try {
      // Try to load existing database from localStorage
      const savedDB = localStorage.getItem(this.dbName);
      
      if (savedDB) {
        // Load existing database
        const uInt8Array = new Uint8Array(JSON.parse(savedDB));
        this.db = new window.SQL.Database(uInt8Array);
      } else {
        // Create new database
        this.db = new window.SQL.Database();
        await this.createTables();
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async createTables() {
    const tables = [
      // Contact submissions table
      `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        company TEXT,
        position TEXT,
        interest TEXT,
        budget TEXT,
        timeline TEXT,
        message TEXT,
        consent INTEGER DEFAULT 0,
        newsletter INTEGER DEFAULT 0,
        source TEXT DEFAULT 'website',
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Chat conversations table
      `CREATE TABLE IF NOT EXISTS chat_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        session_id TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Chat messages table
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        intent TEXT,
        confidence REAL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id)
      )`,

      // User sessions table
      `CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        ip_address TEXT,
        user_agent TEXT,
        page_views INTEGER DEFAULT 1,
        session_duration INTEGER DEFAULT 0,
        referrer TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Analytics events table
      `CREATE TABLE IF NOT EXISTS analytics_events (
        id TEXT PRIMARY KEY,
        session_id TEXT,
        event_type TEXT NOT NULL,
        event_category TEXT,
        event_action TEXT,
        event_label TEXT,
        event_value INTEGER,
        page_url TEXT,
        user_properties TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES user_sessions (id)
      )`,

      // Lead scoring table
      `CREATE TABLE IF NOT EXISTS lead_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        session_id TEXT,
        score INTEGER DEFAULT 0,
        engagement_level TEXT DEFAULT 'low',
        last_interaction DATETIME,
        conversion_probability REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id)
      )`
    ];

    tables.forEach(sql => {
      this.db.run(sql);
    });

    // Create indexes for better performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (email)',
      'CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts (created_at)',
      'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON chat_messages (conversation_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_created ON chat_messages (created_at)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_created ON user_sessions (created_at)',
      'CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events (session_id)',
      'CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events (event_type)'
    ];

    indexes.forEach(sql => {
      this.db.run(sql);
    });

    // Save database
    await this.saveDatabase();
  }

  async saveDatabase() {
    if (!this.db) return;
    
    try {
      const data = this.db.export();
      localStorage.setItem(this.dbName, JSON.stringify(Array.from(data)));
    } catch (error) {
      console.error('Failed to save database:', error);
    }
  }

  // Contact Management
  async saveContact(contactData) {
    if (!this.isInitialized) return null;

    try {
      const sql = `
        INSERT INTO contacts (
          name, email, phone, company, position, interest, 
          budget, timeline, message, consent, newsletter, 
          source, ip_address, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        contactData.name,
        contactData.email,
        contactData.phone || null,
        contactData.company || null,
        contactData.position || null,
        contactData.interest || null,
        contactData.budget || null,
        contactData.timeline || null,
        contactData.message,
        contactData.consent ? 1 : 0,
        contactData.newsletter ? 1 : 0,
        contactData.source || 'website',
        this.getClientIP(),
        navigator.userAgent
      ];

      this.db.run(sql, params);
      await this.saveDatabase();

      // Get the inserted contact ID
      const result = this.db.exec('SELECT last_insert_rowid() as id');
      const contactId = result[0]?.values[0][0];

      // Create lead score entry
      if (contactId) {
        await this.createLeadScore(contactId, contactData);
      }

      return contactId;
    } catch (error) {
      console.error('Failed to save contact:', error);
      return null;
    }
  }

  async getContacts(limit = 50, offset = 0) {
    if (!this.isInitialized) return [];

    try {
      const sql = `
        SELECT c.*, ls.score, ls.engagement_level, ls.conversion_probability
        FROM contacts c
        LEFT JOIN lead_scores ls ON c.id = ls.contact_id
        ORDER BY c.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const result = this.db.exec(sql, [limit, offset]);
      return this.formatResults(result);
    } catch (error) {
      console.error('Failed to get contacts:', error);
      return [];
    }
  }

  // Chat Management
  async saveConversation(conversationData) {
    if (!this.isInitialized) return null;

    try {
      const sql = `
        INSERT OR REPLACE INTO chat_conversations (
          id, user_id, session_id, status
        ) VALUES (?, ?, ?, ?)
      `;

      this.db.run(sql, [
        conversationData.id,
        conversationData.userId || null,
        conversationData.sessionId || null,
        conversationData.status || 'active'
      ]);

      await this.saveDatabase();
      return conversationData.id;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      return null;
    }
  }

  async saveChatMessage(messageData) {
    if (!this.isInitialized) return null;

    try {
      const sql = `
        INSERT INTO chat_messages (
          id, conversation_id, sender, message, intent, confidence, metadata
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        messageData.id,
        messageData.conversationId,
        messageData.sender,
        messageData.message,
        messageData.intent || null,
        messageData.confidence || null,
        messageData.metadata ? JSON.stringify(messageData.metadata) : null
      ]);

      await this.saveDatabase();
      return messageData.id;
    } catch (error) {
      console.error('Failed to save chat message:', error);
      return null;
    }
  }

  async getChatHistory(conversationId, limit = 50) {
    if (!this.isInitialized) return [];

    try {
      const sql = `
        SELECT * FROM chat_messages 
        WHERE conversation_id = ? 
        ORDER BY created_at ASC 
        LIMIT ?
      `;

      const result = this.db.exec(sql, [conversationId, limit]);
      return this.formatResults(result);
    } catch (error) {
      console.error('Failed to get chat history:', error);
      return [];
    }
  }

  // Analytics Management
  async trackEvent(eventData) {
    if (!this.isInitialized) return null;

    try {
      const sql = `
        INSERT INTO analytics_events (
          id, session_id, event_type, event_category, event_action, 
          event_label, event_value, page_url, user_properties
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(sql, [
        eventData.id || this.generateId(),
        eventData.sessionId,
        eventData.type,
        eventData.category || null,
        eventData.action || null,
        eventData.label || null,
        eventData.value || null,
        eventData.pageUrl || window.location.href,
        eventData.userProperties ? JSON.stringify(eventData.userProperties) : null
      ]);

      await this.saveDatabase();
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async getAnalytics(startDate, endDate, eventType = null) {
    if (!this.isInitialized) return [];

    try {
      let sql = `
        SELECT 
          event_type,
          event_category,
          COUNT(*) as count,
          DATE(created_at) as date
        FROM analytics_events 
        WHERE created_at BETWEEN ? AND ?
      `;

      const params = [startDate, endDate];

      if (eventType) {
        sql += ' AND event_type = ?';
        params.push(eventType);
      }

      sql += ' GROUP BY event_type, event_category, DATE(created_at) ORDER BY created_at DESC';

      const result = this.db.exec(sql, params);
      return this.formatResults(result);
    } catch (error) {
      console.error('Failed to get analytics:', error);
      return [];
    }
  }

  // Lead Scoring
  async createLeadScore(contactId, contactData) {
    try {
      let score = 0;
      let engagementLevel = 'low';

      // Calculate score based on data quality and intent
      if (contactData.company) score += 10;
      if (contactData.position) score += 15;
      if (contactData.phone) score += 10;
      if (contactData.budget && contactData.budget !== 'discuss') score += 20;
      if (contactData.timeline && contactData.timeline !== 'planning') score += 15;
      if (contactData.message && contactData.message.length > 100) score += 20;

      // Engagement level based on score
      if (score >= 60) engagementLevel = 'high';
      else if (score >= 30) engagementLevel = 'medium';

      const sql = `
        INSERT INTO lead_scores (
          contact_id, score, engagement_level, conversion_probability, last_interaction
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;

      this.db.run(sql, [
        contactId,
        score,
        engagementLevel,
        score / 100 // Simple probability calculation
      ]);

      await this.saveDatabase();
    } catch (error) {
      console.error('Failed to create lead score:', error);
    }
  }

  // Utility Methods
  formatResults(result) {
    if (!result || !result[0]) return [];
    
    const columns = result[0].columns;
    const values = result[0].values;
    
    return values.map(row => {
      const obj = {};
      columns.forEach((col, index) => {
        obj[col] = row[index];
      });
      return obj;
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getClientIP() {
    // This is a placeholder - in production, you'd get this from server
    return 'unknown';
  }

  setupPeriodicSync() {
    // Auto-save database every 5 minutes
    setInterval(async () => {
      await this.saveDatabase();
    }, 5 * 60 * 1000);

    // Attempt GitHub sync every hour (if configured)
    setInterval(async () => {
      const lastSync = localStorage.getItem('zaindb-last-sync');
      const shouldSync = !lastSync || 
        (Date.now() - new Date(lastSync).getTime()) > (60 * 60 * 1000);
      
      if (shouldSync) {
        await this.syncToGitHub();
      }
    }, 60 * 60 * 1000);
  }

  async syncToGitHub() {
    try {
      const exportData = await this.exportData();
      
      if (!exportData) return false;

      // Create a GitHub Gist with the data (for demo purposes)
      const gistData = {
        description: 'Zain Technologies Website Data Export',
        public: false,
        files: {
          'export.json': {
            content: JSON.stringify(exportData, null, 2)
          }
        }
      };

      // This would require GitHub API token in production
      console.log('Data ready for GitHub sync:', gistData);
      
      // Store export timestamp
      localStorage.setItem('zaindb-last-sync', new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('GitHub sync failed:', error);
      return false;
    }
  }

  async exportData() {
    if (!this.isInitialized) return null;

    try {
      const data = {
        contacts: await this.getContacts(1000),
        conversations: this.formatResults(this.db.exec('SELECT * FROM chat_conversations ORDER BY created_at DESC LIMIT 1000')),
        messages: this.formatResults(this.db.exec('SELECT * FROM chat_messages ORDER BY created_at DESC LIMIT 5000')),
        analytics: await this.getAnalytics(
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          new Date().toISOString()
        )
      };

      return {
        exported_at: new Date().toISOString(),
        version: '1.0',
        data: data
      };
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  fallbackToIndexedDB() {
    console.warn('Falling back to IndexedDB storage');
    // This would implement IndexedDB as fallback
    this.isInitialized = false;
  }

  // Public API
  isReady() {
    return this.isInitialized;
  }

  async cleanup() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.isInitialized = false;
  }

  // Debug methods
  async getStats() {
    if (!this.isInitialized) return null;

    try {
      const stats = {
        contacts: this.db.exec('SELECT COUNT(*) as count FROM contacts')[0]?.values[0][0] || 0,
        conversations: this.db.exec('SELECT COUNT(*) as count FROM chat_conversations')[0]?.values[0][0] || 0,
        messages: this.db.exec('SELECT COUNT(*) as count FROM chat_messages')[0]?.values[0][0] || 0,
        events: this.db.exec('SELECT COUNT(*) as count FROM analytics_events')[0]?.values[0][0] || 0,
        dbSize: JSON.stringify(Array.from(this.db.export())).length
      };

      return stats;
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }
}

// Initialize ZainDB
window.zainDB = new ZainDB();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZainDB;
}