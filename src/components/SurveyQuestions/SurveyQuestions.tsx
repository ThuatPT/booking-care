// SurveyQuestions.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ProgressBar from './ProgressBar'
import Question from './Question'

interface QuestionData {
  questionId: number
  question: string
  options: string[]
  answers: number[]
}

const SurveyQuestions: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [totalScore, setTotalScore] = useState<number | null>(null)
  const [questionsData, setQuestionsData] = useState<QuestionData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/questions')
        setQuestionsData(response.data)
        setAnswers(new Array(response.data.length).fill(0))
        setLoading(false)
      } catch (error) {
        console.error('Failed to fetch questions:', error)
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [])

  const handleAnswer = (answerIndex: number) => {
    const updatedAnswers = [...answers]
    updatedAnswers[currentQuestion] = questionsData[currentQuestion].answers[answerIndex]
    setAnswers(updatedAnswers)
  }

  const navigateToPreviousQuestion = () => {
    setCurrentQuestion((prev) => prev - 1)
    // trả về dữ liệu trước đó của câu hỏi vừa chọn  = answers
    setSelectedAnswer(answers[currentQuestion - 1])
    // và sẽ không cần phải chọn lại câu trả lời đó nữa ở lần lấm vào nút tiếp theo
  }
  // const navigateToNextQuestion = () => {
  //   setCurrentQuestion((prev) => prev + 1)
  //   // check nếu câu trả lời đã được chọn trước đó thì sẽ không cần phải chọn lại nữa
  //   if (answers[currentQuestion + 1] !== 0) {
  //     setSelectedAnswer(answers[currentQuestion + 1])
  //   } else setSelectedAnswer(null)
  // }
  const navigateToNextQuestion = () => {
    const nextQuestion = currentQuestion + 1
    setCurrentQuestion(nextQuestion)

    // If the answer for the next question was previously selected, use it. Otherwise, reset the selected answer.
    if (answers[nextQuestion] !== undefined) {
      setSelectedAnswer(answers[nextQuestion])
    } else {
      setSelectedAnswer(null)
    }

    // If the next question is beyond the last one, calculate the score.
    if (nextQuestion >= questionsData.length) {
      calculateScore()
    }
  }
  const restartSurvey = () => {
    setCurrentQuestion(0)
    setAnswers([])
    setTotalScore(null)
  }

  const calculateScore = () => {
    const score = answers.reduce((acc, curr) => acc + curr, 0)
    setTotalScore(score)
  }

  const evaluateDepressionLevel = (score: number) => {
    if (score < 14) return 'Không biểu hiện trầm cảm'
    if (score >= 14 && score <= 19) return 'Trầm cảm nhẹ'
    if (score >= 20 && score <= 29) return 'Trầm cảm vừa'
    return 'Trầm cảm nặng'
  }

  if (loading) return <div>Loading...</div>

  if (totalScore !== null) {
    return (
      <div className='max-w-md mx-auto mt-8'>
        <div className='text-lg font-semibold text-gray-800 mb-4'>Kết quả</div>
        <div className='text-xl font-semibold text-gray-800 mb-4'>Tổng điểm: {totalScore}</div>
        <div className='text-xl font-semibold text-gray-800 mb-4'>
          Đánh giá mức độ trầm cảm: {evaluateDepressionLevel(totalScore)}
        </div>
        <button
          className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 focus:outline-none'
          onClick={restartSurvey}
        >
          Làm lại
        </button>
      </div>
    )
  }

  return (
    <div className='relative m-auto h-full w-full items-start px-1 md:w-md lg:w-lg xl:w-xl'>
      Trạng thái hoàn thành
      <ProgressBar current={currentQuestion} total={questionsData.length} />
      <Question
        data={questionsData[currentQuestion]}
        onAnswer={handleAnswer}
        selectedAnswer={selectedAnswer}
        setSelectedAnswer={setSelectedAnswer}
      />
      <div className='flex  mt-10 justify-end'>
        {currentQuestion >= 2 && (
          <button
            className='bg-[#28a745] font-semibold px-8 py-2 mx-3 rounded hover:bg-gray-600 text-sm focus:outline-none'
            onClick={restartSurvey}
          >
            Bắt đầu lại
          </button>
        )}
        {currentQuestion > 0 && (
          <button
            className='bg-[#45bee5] font-semibold px-8 py-2 mx-3 rounded  text-sm focus:outline-none'
            onClick={navigateToPreviousQuestion}
          >
            Trước đó
          </button>
        )}
        {currentQuestion < questionsData.length - 1 ? (
          <button
            className={`font-semibold px-8 py-2 mx-3 rounded text-sm focus:outline-none ${
              selectedAnswer === null ? 'bg-gray-400' : 'bg-yellow-400'
            }`}
            onClick={navigateToNextQuestion}
            disabled={selectedAnswer === null}
          >
            Tiếp theo
          </button>
        ) : (
          <button className='bg-[#d2d2d2] text-white px-4 py-2 rounded  focus:outline-none' onClick={calculateScore}>
            Tính điểm
          </button>
        )}
      </div>
    </div>
  )
}

export default SurveyQuestions
