import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { type Thread, type UploadedConversation } from './types';
import { INITIAL_THREADS } from './constants';
import ThreadList from './components/ThreadList';
import ThreadDetailView from './components/KanbanBoard';
import InputModal from './components/InputModal';
import ConversationViewerModal from './components/ExportModal';
import useLocalStorage from './services/useLocalStorage';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type ModalMode = 'addThread' | 'editThread';

interface ModalState {
  isOpen: boolean;
  mode: ModalMode | null;
  title: string;
  label: string;
  initialValue: string;
  editingId: string | null;
}

const App: React.FC = () => {
  const [threads, setThreads] = useLocalStorage<Thread[]>('threads', INITIAL_THREADS);
  const [uploadedConversations, setUploadedConversations] = useLocalStorage<UploadedConversation[]>('uploadedConversations', []);
  
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const [viewingConversation, setViewingConversation] = useState<UploadedConversation | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
    title: '',
    label: '',
    initialValue: '',
    editingId: null,
  });

  // --- DERIVED STATE ---
  const activeConversations = useMemo(() => {
    return uploadedConversations
      .filter(c => c.threadId === activeThreadId)
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [uploadedConversations, activeThreadId]);
  
  // --- SELECTION MANAGEMENT EFFECTS ---
  useEffect(() => {
    if (activeThreadId && !threads.some(t => t.id === activeThreadId)) {
      const sortedRemaining = [...threads].sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());
      setActiveThreadId(sortedRemaining[0]?.id || '');
    }
  }, [threads, activeThreadId]);

  // --- EXPORT ALL DATA ---
  const handleExportAllData = useCallback(async () => {
    const zip = new JSZip();
    const dataFolder = zip.folder('data');

    // Add threads data
    dataFolder?.file('threads.json', JSON.stringify(threads, null, 2));

    // Add conversations data, organized by thread
    const conversationsFolder = dataFolder?.folder('conversations');
    uploadedConversations.forEach(conv => {
      const threadTitle = threads.find(t => t.id === conv.threadId)?.title || 'unthreaded';
      const baseFileName = conv.title.replace(/[^a-z0-9]/gi, '_'); // Sanitize filename
      conversationsFolder?.file(`${threadTitle}/${baseFileName}.txt`, conv.content);
      if (conv.modifications) {
        conversationsFolder?.file(`${threadTitle}/${baseFileName}_modifications.txt`, conv.modifications);
      }
    });

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'mobi-gpt-llm-planner_data.zip');
      alert('데이터 내보내기 완료!');
    } catch (error) {
      console.error('ZIP 파일 생성 중 오류 발생:', error);
      alert('데이터 내보내기 실패!');
    }
  }, [threads, uploadedConversations]);

  // --- CRUD & FILE HANDLING ---
  const handleFileUpload = useCallback((file: File) => {
    if (!activeThreadId) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newConversation: UploadedConversation = {
        id: `conv-${Date.now()}`,
        threadId: activeThreadId,
        title: file.name,
        content: content,
        uploadedAt: new Date().toISOString(),
      };
      setUploadedConversations(prev => [...prev, newConversation]);
      setThreads(prev => prev.map(t => 
        t.id === activeThreadId ? { ...t, lastUpdatedAt: new Date().toISOString() } : t
      ));
    };
    reader.readAsText(file, 'UTF-8');
  }, [activeThreadId]);
  
  const handleDeleteConversation = useCallback((conversationId: string) => {
    setUploadedConversations(prev => prev.filter(c => c.id !== conversationId));
  }, []);

  const handleSaveConversationModification = useCallback((conversationId: string, modification: string) => {
    setUploadedConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId ? { ...conv, modifications: modification } : conv
      )
    );
  }, []);

  // --- MODAL AND CRUD LOGIC ---
  const handleOpenModal = (mode: ModalMode, editingId: string | null = null) => {
    switch (mode) {
      case 'addThread':
        setModalState({ isOpen: true, mode, title: '새 스레드 생성', label: '스레드 제목', initialValue: '', editingId: null });
        break;
      case 'editThread':
        const thread = threads.find(t => t.id === editingId);
        if (thread) {
          setModalState({ isOpen: true, mode, title: '스레드 이름 변경', label: '스레드 제목', initialValue: thread.title, editingId });
        }
        break;
    }
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, mode: null, title: '', label: '', initialValue: '', editingId: null });
  };

  const handleModalSubmit = (value: string) => {
    if (!modalState.mode) return;

    switch (modalState.mode) {
      case 'addThread':
        const newThreadId = `thread-${Date.now()}`;
        const newThread: Thread = { id: newThreadId, title: value, lastUpdatedAt: new Date().toISOString() };
        setThreads(prev => [...prev, newThread]);
        setActiveThreadId(newThreadId);
        break;
      
      case 'editThread':
        if (modalState.editingId) {
          setThreads(prev => prev.map(t => t.id === modalState.editingId ? { ...t, title: value, lastUpdatedAt: new Date().toISOString() } : t));
        }
        break;
    }
    handleCloseModal();
  };

  const handleDeleteThread = useCallback((threadId: string) => {
    if (!window.confirm("정말로 이 스레드를 삭제하시겠습니까? 모든 대화 내용이 영구적으로 삭제됩니다.")) return;
    setThreads(prev => prev.filter(t => t.id !== threadId));
    setUploadedConversations(prev => prev.filter(conv => conv.threadId !== threadId));
  }, []);
  
  return (
    <div className="h-screen w-screen flex bg-gray-100 font-sans overflow-hidden">
      <ThreadList 
        threads={threads}
        activeThreadId={activeThreadId}
        setActiveThreadId={setActiveThreadId}
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onAddThread={() => handleOpenModal('addThread')}
        onUpdateThread={(id) => handleOpenModal('editThread', id)}
        onDeleteThread={handleDeleteThread}
        onExportAllData={handleExportAllData}
      />
      
      <main className="flex-1 flex flex-col h-full min-w-0">
        {activeThreadId ? (
          <ThreadDetailView 
            key={activeThreadId}
            conversations={activeConversations}
            onViewConversation={setViewingConversation}
            onUploadConversation={handleFileUpload}
            onDeleteConversation={handleDeleteConversation}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500">
            스레드를 선택하거나 새로 만들어주세요.
          </div>
        )}
      </main>
      
      <InputModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSubmit={handleModalSubmit}
        title={modalState.title}
        label={modalState.label}
        initialValue={modalState.initialValue}
        submitText={modalState.mode?.startsWith('add') ? '생성' : '저장'}
      />

      <ConversationViewerModal
        isOpen={!!viewingConversation}
        onClose={() => setViewingConversation(null)}
        conversation={viewingConversation}
        onSaveModification={handleSaveConversationModification}
      />
    </div>
  );
};

export default App;
