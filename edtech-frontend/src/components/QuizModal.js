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

  useEffect(() => {
    fetchQuiz();
  }, [courseType]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post(`http://localhost:8081/api/quiz/${courseType}`);
      setQuizzes(response.data.quizzes);
      setLoading(false);
    } catch (err) {
      console.error('퀴즈 로드 실패:', err);
      setError('퀴즈를 불러오는데 실패했습니다. 다시 시도해주세요.');
      setLoading(false);
    }
  };

  const handleAnswerSelect = (quizId, answerIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [quizId]: answerIndex
    });
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
      const response = await axios.post('http://localhost:8081/api/quiz/submit', {
        answers: selectedAnswers,
        courseType: courseType
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
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">퀴즈를 생성하고 있습니다...</p>
          </div>
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
          <div className="text-center mb-6">
            <p className="text-3xl font-bold text-indigo-600 mb-2">
              {result.correctAnswers} / {result.totalQuestions}
            </p>
            <p className="text-lg text-gray-600">
              점수: {result.score.toFixed(0)}점
            </p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">문제 리뷰</h3>
            {quizzes.map((quiz, index) => (
              <div key={quiz.id} className="mb-4 p-4 border rounded">
                <p className="font-semibold mb-2">문제 {index + 1}: {quiz.question}</p>
                <div className="space-y-1">
                  {quiz.options.map((option, optionIndex) => (
                    <div 
                      key={optionIndex}
                      className={`p-2 rounded ${
                        optionIndex === quiz.correctAnswer 
                          ? 'bg-green-100 text-green-800' 
                          : selectedAnswers[quiz.id] === optionIndex 
                            ? 'bg-red-100 text-red-800' 
                            : 'text-gray-600'
                      }`}
                    >
                      {optionIndex + 1}. {option}
                      {optionIndex === quiz.correctAnswer && ' ✓'}
                      {selectedAnswers[quiz.id] === optionIndex && optionIndex !== quiz.correctAnswer && ' ✗'}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-600 mt-2">{quiz.explanation}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={onClose}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            닫기
          </button>
        </div>
      </div>
    );
  }

  const currentQuiz = quizzes[currentQuizIndex];
  const isLastQuestion = currentQuizIndex === quizzes.length - 1;
  const allQuestionsAnswered = quizzes.every(quiz => selectedAnswers[quiz.id] !== undefined);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {courseType === 'aice' ? 'AICE 대비 퀴즈' : '한화에어로스페이스 퀴즈'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">
              문제 {currentQuizIndex + 1} / {quizzes.length}
            </span>
            <div className="flex space-x-1">
              {quizzes.map((_, index) => (
                <div
                  key={index}
                  className={`w-8 h-2 rounded ${
                    selectedAnswers[quizzes[index]?.id] !== undefined
                      ? 'bg-indigo-600' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {currentQuiz && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{currentQuiz.question}</h3>
            <div className="space-y-3">
              {currentQuiz.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(currentQuiz.id, index)}
                  className={`w-full text-left p-4 rounded-lg border ${
                    selectedAnswers[currentQuiz.id] === index
                      ? 'border-indigo-600 bg-indigo-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="font-medium">{index + 1}.</span> {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuizIndex === 0}
            className={`px-4 py-2 rounded ${
              currentQuizIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            이전
          </button>

          <div>
            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQuiz.id] === undefined}
                className={`px-4 py-2 rounded ${
                  selectedAnswers[currentQuiz.id] === undefined
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!allQuestionsAnswered}
                className={`px-4 py-2 rounded ${
                  !allQuestionsAnswered
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                제출하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}