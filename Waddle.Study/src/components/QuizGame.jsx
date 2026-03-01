import { useState, useEffect, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { getQuestionSet } from '../firebase/firestore';

export default function QuizGame({ setId, dojoId = null, isMandatory = false, isBonusBounty = false }) {
    const { navigate, completeQuiz } = useGame();
    const [questions, setQuestions] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [correctAnswerText, setCorrectAnswerText] = useState('');
    const [shuffledAnswers, setShuffledAnswers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [finished, setFinished] = useState(false);
    const timerRef = useRef(null);

    // Use refs for values accessed inside setTimeout callbacks to avoid stale closures
    const scoreRef = useRef(0);
    const streakRef = useRef(0);
    const maxStreakRef = useRef(0);
    // Also keep state versions for UI rendering
    const [displayStreak, setDisplayStreak] = useState(0);

    useEffect(() => {
        loadQuestionSet();
        return () => clearTimeout(timerRef.current);
    }, [setId]);

    async function loadQuestionSet() {
        if (!setId) { navigate('HUB'); return; }
        const set = await getQuestionSet(setId);
        if (!set || !set.questions?.length) {
            navigate('HUB');
            return;
        }
        setQuizTitle(set.title);
        const shuffled = [...set.questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setLoading(false);
    }

    useEffect(() => {
        if (questions.length > 0 && currentIndex < questions.length) {
            shuffleCurrentAnswers();
        }
    }, [currentIndex, questions]);

    function shuffleCurrentAnswers() {
        const q = questions[currentIndex];
        if (!q) return;
        const allAnswers = [q.correctAnswer, ...(q.distractors || [])];
        // Ensure exactly 4 answers, pad if needed
        while (allAnswers.length < 4) {
            allAnswers.push(`Option ${allAnswers.length}`);
        }
        const answers = allAnswers.slice(0, 4).sort(() => Math.random() - 0.5);
        setShuffledAnswers(answers);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setCorrectAnswerText(q.correctAnswer);
    }

    function handleAnswer(answer) {
        if (selectedAnswer !== null) return;

        const q = questions[currentIndex];
        const correct = answer === q.correctAnswer;

        setSelectedAnswer(answer);
        setIsCorrect(correct);

        if (correct) {
            scoreRef.current += 1;
            streakRef.current += 1;
            if (streakRef.current > maxStreakRef.current) {
                maxStreakRef.current = streakRef.current;
            }
            setDisplayStreak(streakRef.current);
            timerRef.current = setTimeout(() => advanceQuestion(), 1200);
        } else {
            streakRef.current = 0;
            setDisplayStreak(0);
            timerRef.current = setTimeout(() => advanceQuestion(), 2000);
        }
    }

    function advanceQuestion() {
        const nextIndex = currentIndex + 1;
        if (nextIndex >= questions.length) {
            finishQuiz();
        } else {
            setCurrentIndex(nextIndex);
        }
    }

    async function finishQuiz() {
        if (finished) return;
        setFinished(true);

        const finalScore = scoreRef.current;
        const finalMaxStreak = maxStreakRef.current;

        const result = await completeQuiz(finalScore, questions.length, {
            dojoId,
            isMandatory,
            isBonusBounty,
            setId,
        });

        navigate('QUIZ_RESULTS', {
            result: {
                ...result,
                correct: finalScore,
                total: questions.length,
                maxStreak: finalMaxStreak,
                setTitle: quizTitle,
            },
        });
    }

    function handleExit() {
        if (confirm('Exit quiz? Progress will be lost.')) {
            clearTimeout(timerRef.current);
            navigate('HUB');
        }
    }

    if (loading) {
        return (
            <div className="waddle-overlay quiz-screen">
                <p className="loading-text">Loading quiz...</p>
            </div>
        );
    }

    if (paused) {
        return (
            <div className="waddle-overlay quiz-screen">
                <div className="quiz-pause-menu">
                    <h3>Paused</h3>
                    <button className="waddle-btn waddle-btn-primary" onClick={() => setPaused(false)}>Resume</button>
                    <button className="waddle-btn waddle-btn-danger" onClick={handleExit}>Exit Quiz</button>
                </div>
            </div>
        );
    }

    const q = questions[currentIndex];
    if (!q) return null;

    return (
        <div className="waddle-overlay quiz-screen">
            {/* Quiz HUD */}
            <div className="quiz-hud">
                <button className="quiz-hud-btn" onClick={() => setPaused(true)}>
                    &#10074;&#10074;
                </button>
                <div className="quiz-progress">
                    {currentIndex + 1} / {questions.length}
                </div>
                <div className={`quiz-streak ${displayStreak >= 3 ? 'streak-fire' : ''}`}>
                    {displayStreak > 0 && (
                        <>
                            {displayStreak >= 3 && <span className="fire-icon">&#128293;</span>}
                            {displayStreak}x
                        </>
                    )}
                </div>
            </div>

            {/* Question prompt */}
            <div className="quiz-prompt-area">
                <div className="quiz-prompt-card">
                    <p className="quiz-prompt-text">{q.prompt}</p>
                </div>
            </div>

            {/* Answer grid (2x2) */}
            <div className="quiz-answers">
                {shuffledAnswers.map((answer, i) => {
                    let btnClass = 'quiz-answer-btn';
                    if (selectedAnswer !== null) {
                        if (answer === correctAnswerText) {
                            btnClass += ' answer-correct';
                        } else if (answer === selectedAnswer && !isCorrect) {
                            btnClass += ' answer-wrong';
                        } else {
                            btnClass += ' answer-disabled';
                        }
                    }

                    return (
                        <button
                            key={i}
                            className={btnClass}
                            onClick={() => handleAnswer(answer)}
                            disabled={selectedAnswer !== null}
                        >
                            {answer}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
