import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateDocument, refineDocument } from '../services/geminiService';
import {
  LogOut,
  Search,
  Send,
  Trash2,
  Download,
  RefreshCw,
  Check,
  Maximize2,
  Minimize2,
  Edit,
  Save,
  Menu,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  X,
  Pencil,
  GripVertical,
  MoreVertical,
  HelpCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DogLogo from './DogLogo';
import { Language } from '../App';
import { translations } from './translations';
import './Dashboard.css';

interface DashboardProps {
  username: string;
  onLogout: () => void;
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
}

interface DocHistory {
  id: number;
  title: string;
  preview: string;
  messages: Message[];
  documentContent: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout, lang, setLang }) => {
  // Layout State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [previewWidth, setPreviewWidth] = useState(45); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile device on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Content States
  const [prompt, setPrompt] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [documentContent, setDocumentContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullPreview, setIsFullPreview] = useState(false);

  // History State
  const [historyDocs, setHistoryDocs] = useState<DocHistory[]>([
    { 
      id: 1, 
      title: 'Project Proposal', 
      preview: 'Outline for the Q3 marketing...', 
      messages: [
        { id: '1', role: 'user', text: 'Write a project proposal for Q3 marketing' },
        { id: '2', role: 'assistant', text: 'Here is the outline for the Q3 marketing proposal...' }
      ],
      documentContent: '# Project Proposal\n\n## Executive Summary\n\nThis proposal outlines...'
    },
    { 
      id: 2, 
      title: 'Email to Client', 
      preview: 'Draft regarding the delays...', 
      messages: [
        { id: '1', role: 'user', text: 'Draft an email to client about delays' },
        { id: '2', role: 'assistant', text: 'Subject: Update on Project Timeline...' }
      ],
      documentContent: 'Subject: Update on Project Timeline\n\nDear Client,\n\nI am writing to inform you...'
    },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Translations
  const t = translations[lang].dashboard;

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // --- RESIZE LOGIC ---
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;
      if (newWidth > 20 && newWidth < 80) {
        setPreviewWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);


  // --- HISTORY ACTIONS ---
  const deleteHistoryItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistoryDocs(prev => prev.filter(item => item.id !== id));
  };

  const startEditingHistory = (item: DocHistory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(item.id);
    setTempTitle(item.title);
    setActiveMenuId(null);
  };

  const saveEditingHistory = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tempTitle.trim()) {
      setHistoryDocs(prev => prev.map(item => item.id === id ? { ...item, title: tempTitle } : item));
    }
    setEditingId(null);
  };

  const cancelEditingHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const toggleMenu = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const handleTemplates = () => {
    setPrompt(t.templatePrompt);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelectChat = (doc: DocHistory) => {
    setActiveChatId(doc.id);
    setMessages(doc.messages);
    setDocumentContent(doc.documentContent);
    if (isMobile) setIsSidebarOpen(false);
  };

  const filteredHistory = historyDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );


  // --- MAIN ACTIONS ---

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMsg = prompt;
    setPrompt('');

    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', text: userMsg };
    setMessages(prev => [...prev, newUserMsg]);

    setLoading(true);
    setIsEditing(false);

    // Ensure preview is open when generating
    setIsPreviewOpen(true);

    try {
      const generatedText = await generateDocument(userMsg, 'document', lang);
      setDocumentContent(generatedText);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: t.draftedMsg
      };
      const updatedMessages = [...messages, newUserMsg, aiMsg];
      setMessages(updatedMessages);

      if (activeChatId) {
        // Update existing chat
        setHistoryDocs(prev => prev.map(doc => 
          doc.id === activeChatId 
            ? { ...doc, messages: updatedMessages, documentContent: generatedText, preview: t.updatedJustNow }
            : doc
        ));
      } else {
        // Create new chat
        const newDocId = Date.now();
        const newDoc: DocHistory = {
          id: newDocId,
          title: userMsg.slice(0, 20) + (userMsg.length > 20 ? '...' : ''),
          preview: t.justNow,
          messages: updatedMessages,
          documentContent: generatedText
        };
        setHistoryDocs(prev => [newDoc, ...prev]);
        setActiveChatId(newDocId);
      }

    } catch (err) {
      console.error(err);
      const errorMsg: Message = { id: Date.now().toString(), role: 'assistant', text: t.errorGenerating };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCorrect = async () => {
    if (!documentContent) return;
    setIsRefining(true);
    try {
      const refined = await refineDocument(documentContent, lang);
      setDocumentContent(refined);
    } catch (error) {
      console.error("Refine error", error);
    } finally {
      setIsRefining(false);
    }
  };

  const handleDownloadWord = () => {
    if (!documentContent) return;
    const previewElement = document.getElementById('markdown-preview-container');
    const htmlContent = previewElement ? previewElement.innerHTML : documentContent;
    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const postHtml = "</body></html>";
    const html = preHtml + htmlContent + postHtml;
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Abdul_DocGen_Document.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="dashboard-container" ref={containerRef}>

      {/* ================= PANEL 1: RED SIDEBAR ================= */}
      {/* Mobile Backdrop */}
      {(isSidebarOpen || (isPreviewOpen && isMobile)) && (
        <div
          className="mobile-backdrop"
          onClick={() => { setIsSidebarOpen(false); setIsPreviewOpen(false); }}
        />
      )}

      {/* ================= PANEL 1: RED SIDEBAR ================= */}
      <div className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo-container">
            <DogLogo />
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="sidebar-close-btn"
            title={t.collapseSidebar}
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Top Bar */}
        <div className="sidebar-top-bar">
          <button
            onClick={() => { 
              setMessages([]); 
              setDocumentContent(''); 
              setActiveChatId(null);
              setPrompt('');
              if (isMobile) setIsSidebarOpen(false);
            }}
            className="sidebar-icon-btn"
            title={t.newChat}
          >
            <Plus className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleTemplates}
            className="sidebar-icon-btn"
            title={t.templates}
          >
            <BookOpen className="w-5 h-5" />
          </button>

          <div className="sidebar-search-container" title={t.search}>
            <Search className="sidebar-search-icon" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sidebar-search-input"
            />
          </div>

          <button
            className="sidebar-icon-btn"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* History List */}
        <div className="history-list">
          <h3 className="history-header">YOUR DRAFTS</h3>
          {filteredHistory.map(doc => (
            <div 
              key={doc.id} 
              className={`history-item ${activeChatId === doc.id ? 'active-item' : ''}`} 
              title={doc.title}
              onClick={() => handleSelectChat(doc)}
            >
              {editingId === doc.id ? (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="w-full text-xs p-1 rounded bg-white/10 text-white border border-white/20 focus:outline-none focus:border-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditingHistory(doc.id, e as any);
                      if (e.key === 'Escape') cancelEditingHistory(e as any);
                    }}
                  />
                  <button onClick={(e) => saveEditingHistory(doc.id, e)} className="text-green-400 hover:text-green-300 p-1"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={cancelEditingHistory} className="text-red-400 hover:text-red-300 p-1"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <>
                  <div className="history-item-content">
                    <div className="history-title">{doc.title}</div>
                    <div className="history-preview">{doc.preview}</div>
                  </div>

                  {/* Three Dots Menu */}
                  <button
                    onClick={(e) => toggleMenu(doc.id, e)}
                    className={`history-menu-btn ${activeMenuId === doc.id ? 'active' : ''}`}
                    title={t.moreOptions}
                  >
                    <MoreVertical className="w-4 h-4 text-white" />
                  </button>

                  {activeMenuId === doc.id && (
                    <div className="history-dropdown">
                      <button
                        onClick={(e) => startEditingHistory(doc, e)}
                        title={t.rename}
                      >
                        <Pencil className="w-3 h-3" />
                        {t.rename}
                      </button>
                      <button
                        onClick={(e) => deleteHistoryItem(doc.id, e)}
                        style={{ color: '#DC2626' }}
                        title={t.delete}
                      >
                        <Trash2 className="w-3 h-3" />
                        {t.delete}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-info">
            <div className="user-avatar">
              <img src={`https://robohash.org/${username}?set=set4`} alt="Avatar" />
            </div>
            <span className="user-name">{username}</span>
          </div>
          <button onClick={onLogout} className="sidebar-close-btn" title={t.logout}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= PANEL 2: MAIN CHAT AREA ================= */}
      <div className="main-content">
        <div className="content-card">
          {/* Header */}
          <div className="main-header">
            <div className="header-left">
              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="header-btn"
                  title={t.openSidebar}
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
              )}
              <div className="header-title">{t.appTitle}</div>
            </div>
            <div className="header-right">
              {!isPreviewOpen && (
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="header-btn"
                  title={t.openSidebar} // Using openSidebar as a proxy for 'Open Preview' or add new translation
                >
                  <PanelRightOpen className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
                className="header-btn text-sm font-medium"
                title={t.switchLanguage}
              >
                {lang === 'en' ? 'TH' : 'EN'}
              </button>
              <button
                onClick={onLogout}
                className="header-btn"
                title={t.logout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          <div className="chat-area">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-logo">
                  <DogLogo />
                </div>
                <h1 className="empty-title">{t.appTitle}</h1>
                <p className="empty-subtitle">{t.appSubtitle}</p>
              </div>
            ) : (
              <div className="messages-list" ref={chatContainerRef}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`message-row ${msg.role}`}>
                    <div className={`message-bubble ${msg.role}`}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm max-w-none">
                          <ReactMarkdown>
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        msg.text
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message-row assistant">
                    <div className="message-bubble assistant">
                      <div className="typing-indicator">
                        <div className="typing-dot" style={{ animationDelay: '0ms' }} />
                        <div className="typing-dot" style={{ animationDelay: '150ms' }} />
                        <div className="typing-dot" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input Area */}
            <div className="input-area">
              <div className="input-container">
                <div className="input-actions">
                  <button onClick={() => { setMessages([]); setDocumentContent(''); }} className="header-btn" title={t.clearChat}>
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={handleAutoCorrect} disabled={!documentContent || isRefining} className="header-btn" title={t.autoCorrect}>
                    <Check className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t.askPlaceholder}
                  className="input-field"
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={!prompt.trim() || loading}
                  className="send-btn"
                  title={t.send}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DRAG HANDLE ================= */}
      {isPreviewOpen && !isFullPreview && (
        <div className="resizer" onMouseDown={startResizing}>
          <div className="resizer-handle"></div>
        </div>
      )}

      {/* ================= PANEL 3: PREVIEW ================= */}
      <div
        className={`preview-panel ${!isPreviewOpen ? 'closed' : ''} ${isFullPreview ? 'full-screen' : ''}`}
        style={{ width: isPreviewOpen && !isFullPreview && !isMobile ? `${previewWidth}%` : undefined }}
      >
        <div className="preview-card-container">
          <div className="preview-header">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="header-btn"
                title={isPreviewOpen ? t.closePreview : t.openSidebar}
              >
                {isPreviewOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
              </button>
              <FileText className="w-5 h-5 text-brand-red" />
              <span className="font-semibold text-gray-700">{t.previewTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsEditing(!isEditing)} className={`header-btn ${isEditing ? 'text-brand-red bg-red-50' : ''}`} title={t.edit}>
                {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </button>
              <button onClick={handleSend} disabled={!documentContent} className="header-btn" title={t.regenerate}>
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={handleDownloadWord} disabled={!documentContent} className="header-btn" title={t.download}>
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsFullPreview(!isFullPreview)}
                className="header-btn"
                title={isFullPreview ? t.exitFullScreen : t.fullScreen}
              >
                {isFullPreview ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="header-btn"
                title={t.closePreview}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="preview-content">
            {documentContent ? (
              <div className="document-card">
                {isEditing ? (
                  <textarea
                    value={documentContent}
                    onChange={(e) => setDocumentContent(e.target.value)}
                    className="document-textarea"
                  />
                ) : (
                  <div className="prose max-w-none">
                    <ReactMarkdown>{documentContent}</ReactMarkdown>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-preview-state">
                <div className="w-16 h-16 bg-gray-200/50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400 italic">{t.noDoc}</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
