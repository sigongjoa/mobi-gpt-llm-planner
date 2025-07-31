import { type Thread } from './types';

export const INITIAL_THREADS: Thread[] = [
    { id: 'thread-1', title: '3분기 마케팅 캠페인', lastUpdatedAt: new Date().toISOString() },
    { id: 'thread-2', title: '신규 웹사이트 런칭', lastUpdatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'thread-3', title: '사용자 피드백 분석', lastUpdatedAt: new Date(Date.now() - 172800000).toISOString() },
];
