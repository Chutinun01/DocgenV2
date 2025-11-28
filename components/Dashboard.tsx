
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
  MoreVertical
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import DogLogo from './DogLogo';
import { Language } from '../App';

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
    { id: 1, title: 'Project Proposal', preview: 'Outline for the Q3 marketing...' },
    { id: 2, title: 'Email to Client', preview: 'Draft regarding the delays...' },
    { id: 3, title: 'Poem about Code', preview: 'In the land of brackets...' },
  ]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Translations
  const t = {
    th: {
      editPlaceholder: "แก้ไขเนื้อหาที่นี่...",
      newChat: "แชทใหม่",
      templates: "เทมเพลต",
      search: "ค้นหา",
      profile: "โปรไฟล์",
      logout: "ออกจากระบบ",
      clearChat: "ล้างแชท",
      autoCorrect: "ตรวจสอบคำผิด",
      send: "ส่งข้อความ",
      fullScreen: "เต็มหน้าจอ",
      closePreview: "ปิดตัวอย่าง",
      regenerate: "สร้างใหม่",
      collapseSidebar: "ซ่อนแถบข้าง",
      openSidebar: "แสดงแถบข้าง",
      openPreview: "แสดงตัวอย่าง",
      moreOptions: "ตัวเลือกเพิ่มเติม",
      exitFullScreen: "ย่อหน้าจอ",
      delete: "ลบ",
      rename: "เปลี่ยนชื่อ"
    },
    en: {
      searchPlaceholder: "Search...",
      yourDocs: "YOUR CHATS",
      welcomeMsg: "Ask me to generate a document...",
      askPlaceholder: "Ask LLM to generate document ...",
      previewTitle: "Preview",
      save: "Save",
      edit: "Edit",
      download: "Download",
      noDoc: "No document generated yet.",
      editPlaceholder: "Edit your content here...",
      newChat: "New Chat",
      templates: "Templates",
      search: "Search",
      profile: "Profile",
      logout: "Log Out",
      clearChat: "Clear Chat",
      autoCorrect: "Auto Correct",
      send: "Send Message",
      fullScreen: "Full Screen",
      closePreview: "Close Preview",
      regenerate: "Regenerate",
      collapseSidebar: "Collapse Sidebar",
      openSidebar: "Open Sidebar",
      openPreview: "Open Preview",
      moreOptions: "More Options",
      exitFullScreen: "Exit Full Screen",
      delete: "Delete",
      rename: "Rename"
    }
  }[lang];

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
    setPrompt(lang === 'th' ? "ช่วยร่างจดหมายสมัครงานตำแหน่งโปรแกรมเมอร์..." : "Draft a cover letter for a software engineer position...");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

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
        text: lang === 'th' ? "ฉันได้ร่างเอกสารให้คุณแล้วทางด้านขวา" : "I've drafted the document for you in the preview panel."
      };
      setMessages(prev => [...prev, aiMsg]);

      const newDocId = Date.now();
      setHistoryDocs(prev => [
        { id: newDocId, title: userMsg.slice(0, 20) + (userMsg.length > 20 ? '...' : ''), preview: 'Just now' },
        ...prev
      ]);

    } catch (err) {
      console.error(err);
      const errorMsg: Message = { id: Date.now().toString(), role: 'assistant', text: "Sorry, I encountered an error generating that." };
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
    <div className="flex h-screen h-[100dvh] bg-white font-sans overflow-hidden selection:bg-brand-red/20" ref={containerRef}>

      {/* ================= PANEL 1: RED SIDEBAR ================= */}
      {/* Mobile Backdrop */}
      {(isSidebarOpen || (isPreviewOpen && isMobile)) && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => { setIsSidebarOpen(false); setIsPreviewOpen(false); }}
        />
      )}

      {/* ================= PANEL 1: RED SIDEBAR ================= */}
      <div
        className={`
            flex flex-col bg-brand-red text-white transition-all duration-300 ease-in-out 
            fixed md:relative inset-y-0 left-0 z-30 shrink-0
            ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full md:w-0 md:translate-x-0 md:opacity-0 md:overflow-hidden'}
        `}
      >
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="w-8 h-8 bg-white rounded-full p-1 shrink-0">
            <DogLogo />
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 text-red-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title={t.collapseSidebar}
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat & Search */}
        <div className="px-4 mb-6 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => { setMessages([]); setDocumentContent(''); }}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors border border-white/10"
              title={t.newChat}
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={handleTemplates}
              className="flex-1 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition-colors border border-white/10"
              title={t.templates}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          <div className="relative" title={t.search}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-200" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white placeholder-red-200/50 focus:outline-none focus:bg-black/30 transition-colors"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-thin scrollbar-thumb-white/20">
          <h3 className="text-[10px] font-bold text-red-200 uppercase tracking-wider mb-2">{t.yourDocs}</h3>
          {filteredHistory.map(doc => (
            <div key={doc.id} className="group p-3 rounded-lg hover:bg-white/10 cursor-pointer transition-colors relative" title={doc.title}>
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
                  <div className="font-medium text-sm truncate pr-8">{doc.title}</div>
                  <div className="text-xs text-red-200/70 truncate">{doc.preview}</div>

                  {/* Three Dots Menu */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <button
                      onClick={(e) => toggleMenu(doc.id, e)}
                      className={`p-1 rounded-full hover:bg-white/20 transition-colors ${activeMenuId === doc.id ? 'opacity-100 bg-white/20' : 'opacity-0 group-hover:opacity-100 text-red-200'}`}
                      title={t.moreOptions}
                    >
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>

                    {activeMenuId === doc.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100 overflow-hidden animate-popup origin-top-right">
                        <button
                          onClick={(e) => startEditingHistory(doc, e)}
                          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-red-50 hover:text-brand-red flex items-center gap-2"
                          title={t.edit}
                        >
                          <Pencil className="w-3 h-3" />
                          {t.edit}
                        </button>
                        <button
                          onClick={(e) => deleteHistoryItem(doc.id, e)}
                          className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                          title={t.delete}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-brand-red-dark/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-full overflow-hidden p-0.5">
              <img src={`https://robohash.org/${username}?set=set4`} alt="Avatar" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="font-medium text-sm truncate max-w-[100px]">{username}</span>
          </div>
          <button onClick={onLogout} className="text-red-200 hover:text-white transition-colors" title={t.logout}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* ================= PANEL 2: MAIN CENTER ================= */}
      <div className="flex-1 flex flex-col relative min-w-0 bg-white">

        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                title={t.openSidebar}
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            )}
            <span className="font-display font-bold text-brand-text">ABDUL DocGenV2</span>
          </div>

          <div className="flex items-center gap-2">
            {!isPreviewOpen && (
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg text-brand-red transition-colors border border-gray-200"
                title={t.openPreview}
              >
                <PanelRightOpen className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">

          {messages.length === 0 ? (
            // Empty State
            <div className="flex-1 flex flex-col items-center justify-center pb-20">
              <div className="w-24 h-24 mb-6">
                <DogLogo />
              </div>
              <h1 className="text-3xl font-display font-bold text-brand-red mb-2">ABDUL</h1>
              <h2 className="text-lg font-display font-bold text-gray-400 tracking-[0.2em] mb-6">DOCGENV2</h2>
              <p className="text-gray-400">{t.welcomeMsg}</p>
            </div>
          ) : (
            // Chat Messages
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-200 pb-32">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                    ? 'bg-brand-red text-white rounded-br-none'
                    : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-brand-red/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-brand-red/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-brand-red/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Input Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent">
            <div className="max-w-3xl mx-auto relative shadow-lg rounded-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2 text-gray-400">
                <button onClick={() => { setMessages([]); setDocumentContent(''); }} className="hover:text-red-500 transition-colors" title={t.clearChat}>
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-px h-5 bg-gray-200"></div>
                <button onClick={handleAutoCorrect} disabled={!documentContent} className="hover:text-brand-red transition-colors disabled:opacity-30" title={t.autoCorrect}>
                  <Check className="w-5 h-5" />
                </button>
              </div>

              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.askPlaceholder}
                className="w-full pl-24 pr-14 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-red/10 focus:border-brand-red/30 bg-white text-gray-700 placeholder-gray-400"
              />

              <button
                onClick={handleSend}
                disabled={!prompt.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand-red/90 text-white rounded-xl hover:bg-brand-red transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.send}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DRAG HANDLE ================= */}
      {
        isPreviewOpen && !isFullPreview && (
          <div
            className="w-1 bg-gray-100 hover:bg-brand-red/50 cursor-col-resize flex items-center justify-center z-40 transition-colors"
            onMouseDown={startResizing}
          >
            <div className="h-8 w-1 bg-gray-300 rounded-full"></div>
          </div>
        )
      }


      {/* ================= PANEL 3: PREVIEW (RIGHT) ================= */}
      <div
        className={`
            flex flex-col bg-gray-50 border-l border-gray-200 transition-all duration-300 ease-in-out
            fixed md:relative inset-y-0 right-0 z-40 shrink-0
            ${isPreviewOpen
            ? (isFullPreview ? 'w-full' : 'w-full md:w-auto')
            : 'w-0 translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'}
        `}
        style={{ width: isPreviewOpen && !isFullPreview && !isMobile ? `${previewWidth}%` : undefined }}
      >
        {/* Preview Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setIsPreviewOpen(false); setIsFullPreview(false); }}
              className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
              title={t.closePreview}
            >
              <PanelRightClose className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-brand-red font-bold">
              <FileText className="w-5 h-5" />
              <span>{t.previewTitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setIsEditing(!isEditing)} className={`p-1.5 rounded hover:bg-gray-100 ${isEditing ? 'text-brand-red bg-red-50' : 'text-gray-400'}`} title={t.edit}>
              {isEditing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
            </button>
            <button onClick={handleSend} disabled={!documentContent} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-red" title={t.regenerate}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleDownloadWord} disabled={!documentContent} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-brand-red" title="Download Word">
              <Download className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-gray-300 mx-1"></div>
            <button onClick={() => setIsFullPreview(!isFullPreview)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400" title={isFullPreview ? t.exitFullScreen : t.fullScreen}>
              {isFullPreview ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gray-100/50">
          <div className={`bg-white shadow-sm border border-gray-200 min-h-full rounded-xl p-8 md:p-12 mx-auto ${isFullPreview ? 'max-w-5xl' : 'max-w-none'}`}>
            {documentContent ? (
              isEditing ? (
                <textarea
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  className="w-full h-full min-h-[500px] resize-none focus:outline-none font-mono text-sm"
                />
              ) : (
                <article className="prose prose-red prose-sm max-w-none">
                  <ReactMarkdown>{documentContent}</ReactMarkdown>
                </article>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-200" />
                </div>
                <p className="italic">{t.noDoc}</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div >
  );
};

export default Dashboard;
