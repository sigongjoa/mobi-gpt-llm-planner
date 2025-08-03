import React, { useState, useMemo, useEffect } from 'react';
import { type UploadedConversation, type MabinogiData, type Character, type Message } from '../types';
import { CloseIcon, UserGroupIcon, ArchiveBoxIcon, CubeTransparentIcon, ChatBubbleLeftRightIcon } from './icons';

interface ConversationViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: UploadedConversation | null;
  onSaveModification: (conversationId: string, modification: string) => void;
}

const CharacterInfoCard: React.FC<{character: Character}> = ({ character }) => (
    <div className="bg-slate-100 rounded-lg p-4 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-lg font-bold text-indigo-700">{character.name}</p>
                <p className="text-sm text-slate-500">{character.subName} @ {character.server}</p>
            </div>
            <div className="text-right flex-shrink-0 ml-2">
                <p className="text-sm font-semibold text-amber-600">{character.gold.toLocaleString()} Gold</p>
            </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="bg-white p-2 rounded">
                <p className="text-slate-500">포실 은화</p>
                <p className="font-semibold text-slate-800">{character.silverCoins} / {character.silverCoinsMax}</p>
            </div>
            <div className="bg-white p-2 rounded">
                <p className="text-slate-500">포모르 공헌도</p>
                <p className="font-semibold text-slate-800">{character.fomorianTribute} / {character.fomorianTributeMax}</p>
            </div>
        </div>
    </div>
);

const JsonViewer: React.FC<{ data: MabinogiData }> = ({ data }) => {
    const [activeTab, setActiveTab] = useState<'characters' | 'inventory' | 'craftingJobs' | 'messages' | null>(null);

    const tabs = useMemo(() => {
        const availableTabs = [];
        if (data.characters && data.characters.length > 0) availableTabs.push({ id: 'characters', name: '캐릭터', icon: UserGroupIcon, count: data.characters.length });
        if (data.inventory && Object.keys(data.inventory).length > 0) availableTabs.push({ id: 'inventory', name: '인벤토리', icon: ArchiveBoxIcon, count: Object.keys(data.inventory).length });
        if (data.craftingJobs && Object.keys(data.craftingJobs).length > 0) availableTabs.push({ id: 'craftingJobs', name: '제작', icon: CubeTransparentIcon, count: Object.keys(data.craftingJobs).length });
        if (data.messages && data.messages.length > 0) availableTabs.push({ id: 'messages', name: '메시지', icon: ChatBubbleLeftRightIcon, count: data.messages.length });
        return availableTabs;
    }, [data]);
    
    useEffect(() => {
        if (tabs.length > 0) {
            const currentTabExists = tabs.some(t => t.id === activeTab);
            if (!currentTabExists) {
                 setActiveTab(tabs[0].id as any);
            }
        }
    }, [tabs, activeTab]);

    // Helper function to calculate total item count
    const calculateTotalCount = (countData: any): number => {
        if (typeof countData === 'number') {
            return countData;
        }
        if (typeof countData === 'object' && countData !== null) {
            return Object.values(countData)
                .filter((value): value is number => typeof value === 'number')
                .reduce((sum, current) => sum + current, 0);
        }
        return 0;
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'characters':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-1">
                        {data.characters.map(char => <CharacterInfoCard key={char.id} character={char} />)}
                    </div>
                );
            case 'inventory':
                const inventoryItems = Object.entries(data.inventory || {}).sort(([a], [b]) => a.localeCompare(b));
                 return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
                        {inventoryItems.map(([item, countData]) => (
                            <div key={item} className="bg-slate-100 rounded-lg p-3 text-sm border border-slate-200">
                                <p className="font-semibold text-slate-800 truncate" title={item}>{item}</p>
                                <p className="text-slate-600 mt-1">수량: <span className="font-bold text-indigo-600">{calculateTotalCount(countData).toLocaleString()}</span></p>
                            </div>
                        ))}
                    </div>
                );
            case 'messages':
                return (
                    <div className="space-y-4 p-2">
                        {(data.messages || []).map((msg: Message, index: number) => {
                            const anyMsg = msg as any;
                            const text = anyMsg.content ?? anyMsg.text ?? (anyMsg.parts?.[0]?.text) ?? '';
                            
                            return (
                                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.role === 'model' && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" title="Model">
                                           AI
                                        </div>
                                    )}
                                    <div className={`max-w-xl p-3 rounded-xl shadow-sm ${
                                        msg.role === 'user'
                                            ? 'bg-sky-500 text-white rounded-br-none'
                                            : 'bg-slate-200 text-slate-800 rounded-bl-none'
                                    }`}>
                                        <p className="text-sm break-words" style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
                                    </div>
                                     {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0" title="User">
                                           나
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                );
            default: return <div className="text-center text-slate-500 py-10">탭을 선택하여 데이터를 확인하세요.</div>;
        }
    }
    
    if (tabs.length === 0) {
        return <div className="text-center text-slate-500 py-10">데이터 파일에 표시할 내용이 없습니다.</div>;
    }

    return (
         <div className="flex flex-col h-full">
             <div className="flex-shrink-0 border-b border-slate-200">
                <nav className="flex space-x-1 sm:space-x-2" aria-label="Tabs">
                     {tabs.map(tabInfo => {
                         const Icon = tabInfo.icon;
                         const isSelected = activeTab === tabInfo.id;
                         return (
                            <button
                                key={tabInfo.id}
                                onClick={() => setActiveTab(tabInfo.id as any)}
                                className={`
                                    ${isSelected ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}
                                    group flex items-center px-2 sm:px-3 py-2 font-medium text-sm rounded-t-lg focus:outline-none whitespace-nowrap
                                `}
                            >
                                <Icon className={`-ml-0.5 mr-2 h-5 w-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                                <span>{tabInfo.name}</span>
                                <span className={`
                                    ${isSelected ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'}
                                    hidden sm:inline-block ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                                `}>
                                    {tabInfo.count}
                                </span>
                            </button>
                         )
                     })}
                </nav>
            </div>
            <div className="flex-grow overflow-y-auto pt-4 bg-slate-50/50 rounded-b-lg">
                {renderContent()}
            </div>
        </div>
    );
};

const ConversationViewerModal: React.FC<ConversationViewerModalProps> = ({ isOpen, onClose, conversation, onSaveModification }) => {
  if (!isOpen || !conversation) return null;

  const [activeTab, setActiveTab] = useState<'content' | 'modifications'>('content');
  const [currentModification, setCurrentModification] = useState<string>('');

  useEffect(() => {
    if (conversation) {
      setCurrentModification(conversation.modifications || '');
      setActiveTab('content'); // Reset to content tab when conversation changes
    }
  }, [conversation]);

  const handleSave = () => {
    if (conversation) {
      onSaveModification(conversation.id, currentModification);
      alert('수정 사항이 저장되었습니다.');
    }
  };

  const parsedData = useMemo(() => {
    try {
      const data = JSON.parse(conversation.content);
      // Basic validation to check if it looks like the expected Mabinogi data structure
      if (data && typeof data === 'object' && ('characters' in data || 'inventory' in data || 'messages' in data)) {
        return data as MabinogiData;
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [conversation]);


  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="conversation-viewer-title"
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 sm:p-8 w-full max-w-4xl m-4 flex flex-col h-[90vh] transform transition-all duration-300" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 id="conversation-viewer-title" className="text-2xl font-bold text-slate-900 truncate pr-4" title={conversation.title}>
            {conversation.title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100" aria-label="닫기">
            <CloseIcon />
          </button>
        </div>

        <div className="flex-grow min-h-0 flex flex-col">
          <div className="flex-shrink-0 border-b border-slate-200 mb-4">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('content')}
                className={`
                  ${activeTab === 'content' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                `}
              >
                기존 대화 보기
              </button>
              <button
                onClick={() => setActiveTab('modifications')}
                className={`
                  ${activeTab === 'modifications' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                `}
              >
                수정 사항/메모
              </button>
            </nav>
          </div>
          <div className="flex-grow overflow-y-auto">
            {activeTab === 'content' && (
              parsedData ? (
                <JsonViewer data={parsedData} />
              ) : (
                <textarea
                    readOnly
                    value={conversation.content}
                    className="w-full h-full bg-slate-50 border border-slate-300 rounded-lg p-4 text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    aria-label="대화 내용"
                />
              )
            )}
            {activeTab === 'modifications' && (
              <div className="flex flex-col h-full">
                <textarea
                  value={currentModification}
                  onChange={(e) => setCurrentModification(e.target.value)}
                  className="w-full h-full bg-slate-50 border border-slate-300 rounded-lg p-4 text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  placeholder="여기에 수정 사항이나 메모를 입력하세요..."
                  aria-label="수정 사항 및 메모"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    저장
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-200 text-slate-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConversationViewerModal;