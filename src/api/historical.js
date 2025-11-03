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