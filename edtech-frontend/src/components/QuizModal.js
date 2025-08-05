import { useState, useEffect } from 'react';
import axios from 'axios';

export default function QuizModal({ courseType, onClose }) {
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const summaryIdMap = {
    aice: 1,
    hanwha: 2
  };
  const summaryId = summaryIdMap[courseType] || 1;

  useEffect(() => {
    fetchQuiz();
  }, [summaryId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:8081/quiz/${summaryId}`);
      console.log("퀴즈 응답:", response.data);

      if (!response.data || response.data.length === 0) {
        setError('퀴즈가 없습니다. 생성이 필요합니다.');
        setLoading(false);
        return;
      }

      setQuizzes(response.data);
      setSelectedAnswers({});
      setCurrentQuizIndex(0);
      setShowResult(false);
      setResult(null);
      setLoading(false);
    } catch (err) {
      console.error('퀴즈 로드 실패:', err);
      setError('퀴즈를 불러오는데 실패했습니다.');
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/sample.vtt');
      if (!response.ok) throw new Error("sample.vtt 파일을 찾을 수 없습니다.");
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('file', blob, 'sample.vtt');

      await axios.post('http://localhost:8081/generate-quiz', formData);
      await fetchQuiz();
    } catch (err) {
      console.error('퀴즈 생성 실패:', err);
      setError('샘플 자막 파일을 불러올 수 없습니다.');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (quizId, answer) => {
    setSelectedAnswers(prev => ({ ...prev, [String(quizId)]: answer }));
  };

  const handleNext = () => {
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuizIndex > 0) {
      setCurrentQuizIndex(currentQuizIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:8081/submit-quiz', {
        answers: selectedAnswers,
        summary_id: summaryId,
        user_id: 1
      });
      setResult(response.data);
      setShowResult(true);
    } catch (err) {
      console.error('퀴즈 제출 실패:', err);
      alert('퀴즈 제출에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">퀴즈를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h3 className="text-lg font-semibold text-red-600 mb-4">오류 발생</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={handleGenerateQuiz}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-2"
          >
            퀴즈 생성하기 →
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">퀴즈 결과</h2>
          <p className="text-center text-lg mb-4">
            맞힌 개수: {result.correct} / {result.total} ({result.score}점)
          </p>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">문제 리뷰</h3>
            {result.feedback.map((fb, index) => (
              <div key={index} className="mb-4 p-4 border rounded">
                <p className="font-semibold mb-2">문제: {fb.question}</p>
                <p>선택한 답: {fb.selected}</p>
                <p>정답: {fb.correct}</p>
                <p>{fb.is_correct ? "✅ 정답" : "❌ 오답"}</p>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            닫기
          </button>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  if (!currentQuiz) return null;

  const isLastQuestion = currentQuizIndex === quizzes.length - 1;
  const allAnswered = quizzes.every(q => selectedAnswers[String(q.quiz_id)]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">퀴즈 풀기</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <h3 className="text-lg font-semibold mb-2">
          문제 {currentQuizIndex + 1} / {quizzes.length}
        </h3>
        <h3 className="text-lg font-semibold mb-4">{currentQuiz.question}</h3>

        <div className="space-y-2 mb-6">
          {currentQuiz.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(currentQuiz.quiz_id, option.label)}
              className={`w-full text-left p-3 rounded border ${
                selectedAnswers[String(currentQuiz.quiz_id)] === option.label
                  ? 'bg-indigo-100 border-indigo-600'
                  : 'border-gray-300'
              }`}
            >
              {option.label}. {option.text}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuizIndex === 0}
            className="px-4 py-2 bg-gray-400 text-white rounded disabled:opacity-50"
          >
            이전
          </button>
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              disabled={!selectedAnswers[String(currentQuiz.quiz_id)]}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              다음
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            >
              제출하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}









