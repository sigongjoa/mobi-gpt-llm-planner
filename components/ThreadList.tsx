import React, { useState } from 'react';
import { type Thread } from '../types';
import { ChevronLeftIcon, SearchIcon, MenuIcon, PlusIcon, PencilIcon, TrashIcon } from './icons';

interface ThreadListProps {
  threads: Thread[];
  activeThreadId: string;
  setActiveThreadId: (id: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
  onAddThread: () => void;
  onUpdateThread: (id: string) => void;
  onDeleteThread: (id: string) => void;
  onExportAllData: () => void;
}

const ThreadList: React.FC<ThreadListProps> = ({ threads, activeThreadId, setActiveThreadId, isCollapsed, onToggle, onAddThread, onUpdateThread, onDeleteThread, onExportAllData }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const sortedThreads = [...threads].sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime());

  const filteredThreads = sortedThreads.filter(thread =>
    thread.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "년 전";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "달 전";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "일 전";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "시간 전";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "분 전";
    return "방금 전";
  };
  
  const handleUpdate = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    onUpdateThread(threadId);
  };

  const handleDelete = (e: React.MouseEvent, threadId: string) => {
      e.stopPropagation();
      onDeleteThread(threadId);
  };

  return (
    <aside className={`flex-shrink-0 bg-white h-full flex flex-col border-r border-gray-200 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-80'}`}>
      <div className={`p-4 border-b border-gray-200 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-slate-900 truncate">스레드</h1>}
        <div className="flex items-center gap-2">
            {!isCollapsed && (
                <button onClick={onAddThread} title="새 스레드" className="p-1 rounded-md hover:bg-gray-200 text-slate-600">
                    <PlusIcon className="w-5 h-5" />
                </button>
            )}
            <button onClick={onToggle} className="p-1 rounded-md hover:bg-gray-200 text-slate-600">
              {isCollapsed ? <MenuIcon className="w-6 h-6" /> : <ChevronLeftIcon />}
            </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-2 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="스레드 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 border border-transparent rounded-lg py-2 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <ul>
          {filteredThreads.map(thread => (
            <li key={thread.id}>
              <button
                onClick={() => setActiveThreadId(thread.id)}
                title={isCollapsed ? thread.title : ''}
                className={`w-full text-left p-4 border-b border-gray-200/50 hover:bg-gray-100 transition-colors focus:outline-none group ${
                  thread.id === activeThreadId ? 'bg-sky-100' : ''
                } ${isCollapsed ? 'flex justify-center' : ''}`}
              >
                {isCollapsed ? (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${thread.id === activeThreadId ? 'bg-sky-600' : 'bg-slate-500'}`}>
                    {thread.title.charAt(0)}
                  </div>
                ) : (
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 truncate pr-2">{thread.title}</h3>
                        <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                            <div onClick={(e) => handleUpdate(e, thread.id)} className="p-1 rounded-md text-slate-500 hover:bg-gray-200 hover:text-slate-800 cursor-pointer" role="button" aria-label="스레드 이름 변경">
                                <PencilIcon className="w-4 h-4" />
                            </div>
                            <div onClick={(e) => handleDelete(e, thread.id)} className="p-1 rounded-md text-slate-500 hover:bg-gray-200 hover:text-red-600 cursor-pointer" role="button" aria-label="스레드 삭제">
                                <TrashIcon className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500">{timeAgo(thread.lastUpdatedAt)}</p>
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onExportAllData}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            모든 데이터 내보내기 (ZIP)
          </button>
        </div>
      )}
    </aside>
  );
};

export default ThreadList;