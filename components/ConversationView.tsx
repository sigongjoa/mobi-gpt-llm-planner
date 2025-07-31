import React, { useRef } from 'react';
import { type UploadedConversation } from '../types';
import { UploadIcon, DocumentDuplicateIcon, TrashIcon } from './icons';

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

const ConversationCard: React.FC<{
  conversation: UploadedConversation;
  onView: () => void;
  onDelete: (e: React.MouseEvent) => void;
}> = ({ conversation, onView, onDelete }) => {
    return (
        <div className="group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col">
            <button onClick={onView} className="flex-grow p-4 text-left focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg">
                <div className="flex items-start gap-4">
                    <DocumentDuplicateIcon className="w-10 h-10 text-slate-400 flex-shrink-0 mt-1" />
                    <div className="flex-grow min-w-0">
                        <p className="text-base font-semibold text-slate-800 truncate" title={conversation.title}>
                            {conversation.title}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            업로드: {timeAgo(conversation.uploadedAt)}
                        </p>
                    </div>
                </div>
            </button>
            <button
                onClick={onDelete}
                aria-label="대화 삭제"
                className="absolute top-2 right-2 p-1.5 rounded-full text-slate-400 bg-white/50 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-red-600 focus:opacity-100 transition-opacity"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
    );
};

interface ConversationListViewProps {
  conversations: UploadedConversation[];
  onViewConversation: (conversation: UploadedConversation) => void;
  onDeleteConversation: (conversationId: string) => void;
  onUploadConversation: (file: File) => void;
}

const ConversationListView: React.FC<ConversationListViewProps> = ({ conversations, onViewConversation, onDeleteConversation, onUploadConversation }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUploadConversation(file);
    }
    // Reset input to allow uploading the same file again
    event.target.value = '';
  };
  
  const handleDelete = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm("이 대화를 삭제하시겠습니까?")) {
        onDeleteConversation(conversationId);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 p-4 lg:p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-800">업로드된 대화</h2>
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500"
        >
          <UploadIcon />
          대화 업로드 (.txt, .json)
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.json"
        />
      </div>

      {conversations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {conversations.map(conv => (
            <ConversationCard
              key={conv.id}
              conversation={conv}
              onView={() => onViewConversation(conv)}
              onDelete={(e) => handleDelete(e, conv.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center text-slate-500">
                <DocumentDuplicateIcon className="w-16 h-16 mx-auto text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">업로드된 대화 없음</h3>
                <p className="mt-1 text-sm">오른쪽 상단의 '대화 업로드' 버튼을 사용하여 첫 대화를 추가하세요.</p>
            </div>
        </div>
      )}
    </div>
  );
};

export default ConversationListView;
