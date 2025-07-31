import React from 'react';
import { type UploadedConversation } from '../types';
import ConversationListView from './ConversationView';

interface ThreadDetailViewProps {
  conversations: UploadedConversation[];
  onViewConversation: (conversation: UploadedConversation) => void;
  onUploadConversation: (file: File) => void;
  onDeleteConversation: (conversationId: string) => void;
}

const ThreadDetailView: React.FC<ThreadDetailViewProps> = (props) => {
  const {
    conversations,
    onViewConversation,
    onUploadConversation,
    onDeleteConversation,
  } = props;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Uploaded Conversations Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <ConversationListView 
          conversations={conversations}
          onViewConversation={onViewConversation}
          onDeleteConversation={onDeleteConversation}
          onUploadConversation={onUploadConversation}
        />
      </div>
    </div>
  );
};

export default ThreadDetailView;
