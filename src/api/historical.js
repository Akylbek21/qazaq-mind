import { getJSON, postJSON } from './client';

export const fetchTests = () => {
  return getJSON('/historical/tests');
};

export const fetchQuestions = (testId) => {
  return getJSON(`/historical/tests/${testId}/questions`);
};

export const submitAnswer = (questionId, chosen) => {
  return postJSON('/historical/answer', {
    questionId,
    chosen
  });
};

export const fetchResult = (testId) => {
  return getJSON(`/historical/tests/${testId}/result`);
};

// Чат с персонажем
export const fetchPersonality = () => {
  return getJSON('/historical/chat/personality');
};

export const sendChatMessage = (message) => {
  return postJSON('/historical/chat/send', { message });
};

export const fetchChatHistory = (page = 0, size = 20) => {
  return getJSON(`/historical/chat/history?page=${page}&size=${size}`);
};