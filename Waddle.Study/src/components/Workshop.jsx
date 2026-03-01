import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGame } from '../contexts/GameContext';
import { createQuestionSet, getUserSets, updateQuestionSet, deleteQuestionSet } from '../firebase/firestore';

export default function Workshop() {
    const { uid, role } = useAuth();
    const { goBack, navigate } = useGame();
    const [view, setView] = useState('list'); // list | create | edit
    const [mySets, setMySets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingSet, setEditingSet] = useState(null);

    useEffect(() => {
        loadSets();
    }, [uid]);

    async function loadSets() {
        setLoading(true);
        const sets = await getUserSets(uid);
        setMySets(sets);
        setLoading(false);
    }

    function handleEdit(set) {
        setEditingSet(set);
        setView('edit');
    }

    async function handleDelete(setId) {
        if (!confirm('Delete this question set?')) return;
        await deleteQuestionSet(setId);
        await loadSets();
    }

    return (
        <div className="waddle-overlay workshop-screen">
            <div className="screen-header">
                <button className="waddle-btn back-btn" onClick={goBack}>&larr; Back</button>
                <h2>The Workshop</h2>
            </div>

            {view === 'list' && (
                <div className="workshop-list">
                    <button className="waddle-btn waddle-btn-primary" onClick={() => setView('create')}>
                        + New Question Set
                    </button>
                    {loading ? (
                        <p className="loading-text">Loading your sets...</p>
                    ) : mySets.length === 0 ? (
                        <p className="empty-text">You haven&apos;t created any question sets yet.</p>
                    ) : (
                        <div className="set-list">
                            {mySets.map(set => (
                                <div key={set.setId} className="set-card">
                                    <div className="set-card-info">
                                        <h4>{set.title}</h4>
                                        <p>{set.questions?.length || 0} questions</p>
                                        <div className="set-badges">
                                            {set.isVerified && <span className="badge badge-verified">Verified</span>}
                                            {set.isPublic && <span className="badge badge-public">Public</span>}
                                            {!set.isPublic && <span className="badge badge-private">Private</span>}
                                        </div>
                                    </div>
                                    <div className="set-card-actions">
                                        <button className="waddle-btn btn-sm" onClick={() => handleEdit(set)}>Edit</button>
                                        <button className="waddle-btn btn-sm waddle-btn-danger" onClick={() => handleDelete(set.setId)}>Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {(view === 'create' || view === 'edit') && (
                <QuestionSetEditor
                    existingSet={view === 'edit' ? editingSet : null}
                    authorId={uid}
                    authorRole={role}
                    onSave={async () => {
                        await loadSets();
                        setView('list');
                        setEditingSet(null);
                    }}
                    onCancel={() => { setView('list'); setEditingSet(null); }}
                />
            )}
        </div>
    );
}

function QuestionSetEditor({ existingSet, authorId, authorRole, onSave, onCancel }) {
    const [title, setTitle] = useState(existingSet?.title || '');
    const [questions, setQuestions] = useState(existingSet?.questions || []);
    const [saving, setSaving] = useState(false);

    // Current question being added
    const [prompt, setPrompt] = useState('');
    const [correctAnswer, setCorrectAnswer] = useState('');
    const [distractors, setDistractors] = useState(['', '', '']);
    const [autoDistractors, setAutoDistractors] = useState(true);

    const promptRef = useRef(null);
    const answerRef = useRef(null);

    function addQuestion() {
        if (!prompt.trim() || !correctAnswer.trim()) return;

        let finalDistractors;
        if (autoDistractors && questions.length >= 3) {
            // Auto-generate distractors from other questions' correct answers
            const otherAnswers = questions
                .map(q => q.correctAnswer)
                .filter(a => a !== correctAnswer.trim());
            // Shuffle and pick up to 3
            const shuffled = [...otherAnswers].sort(() => Math.random() - 0.5);
            finalDistractors = shuffled.slice(0, 3);
            // Fill remaining slots with manual distractors if needed
            while (finalDistractors.length < 3) {
                const manual = distractors[finalDistractors.length];
                finalDistractors.push(manual?.trim() || `Option ${finalDistractors.length + 1}`);
            }
        } else {
            finalDistractors = distractors
                .map(d => d.trim())
                .filter(d => d.length > 0);
            while (finalDistractors.length < 3) {
                finalDistractors.push(`Option ${finalDistractors.length + 1}`);
            }
        }

        setQuestions([...questions, {
            prompt: prompt.trim(),
            correctAnswer: correctAnswer.trim(),
            distractors: finalDistractors.slice(0, 3),
        }]);

        setPrompt('');
        setCorrectAnswer('');
        setDistractors(['', '', '']);
        promptRef.current?.focus();
    }

    function removeQuestion(idx) {
        setQuestions(questions.filter((_, i) => i !== idx));
    }

    async function handleSave() {
        if (!title.trim() || questions.length === 0) return;
        setSaving(true);
        try {
            if (existingSet) {
                await updateQuestionSet(existingSet.setId, { title, questions });
            } else {
                await createQuestionSet(authorId, authorRole, title, questions);
            }
            onSave();
        } catch (err) {
            console.error('Save failed:', err);
            setSaving(false);
        }
    }

    function handlePromptKeyDown(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            answerRef.current?.focus();
        }
    }

    function handleAnswerKeyDown(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (autoDistractors || distractors.every(d => d.trim())) {
                addQuestion();
            }
        } else if (e.key === 'Tab') {
            e.preventDefault();
            setAutoDistractors(false);
            document.getElementById('distractor-0')?.focus();
        }
    }

    return (
        <div className="question-editor">
            <div className="editor-header">
                <input
                    type="text"
                    className="waddle-input title-input"
                    placeholder="Question Set Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>

            {/* Rapid-fire question entry */}
            <div className="question-entry">
                <h4>Add Questions</h4>
                <p className="hint-text">Type prompt &rarr; Tab &rarr; Answer &rarr; Enter (auto-fills wrong answers) or Tab for manual</p>

                <div className="entry-fields">
                    <input
                        ref={promptRef}
                        type="text"
                        className="waddle-input"
                        placeholder="Question prompt"
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        onKeyDown={handlePromptKeyDown}
                    />
                    <input
                        ref={answerRef}
                        type="text"
                        className="waddle-input"
                        placeholder="Correct answer"
                        value={correctAnswer}
                        onChange={e => setCorrectAnswer(e.target.value)}
                        onKeyDown={handleAnswerKeyDown}
                    />
                    {!autoDistractors && (
                        <div className="distractor-fields">
                            {distractors.map((d, i) => (
                                <input
                                    key={i}
                                    id={`distractor-${i}`}
                                    type="text"
                                    className="waddle-input distractor-input"
                                    placeholder={`Wrong answer ${i + 1}`}
                                    value={d}
                                    onChange={e => {
                                        const newD = [...distractors];
                                        newD[i] = e.target.value;
                                        setDistractors(newD);
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addQuestion();
                                        }
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    <button className="waddle-btn waddle-btn-primary" onClick={addQuestion}>
                        Add Question
                    </button>
                </div>
            </div>

            {/* Question list */}
            <div className="question-list">
                <h4>Questions ({questions.length})</h4>
                {questions.map((q, i) => (
                    <div key={i} className="question-item">
                        <div className="question-item-content">
                            <p className="question-prompt"><strong>Q{i + 1}:</strong> {q.prompt}</p>
                            <p className="question-answer">&#10004; {q.correctAnswer}</p>
                            <p className="question-distractors">
                                &#10008; {q.distractors.join(' | ')}
                            </p>
                        </div>
                        <button className="waddle-btn btn-sm waddle-btn-danger" onClick={() => removeQuestion(i)}>
                            &#10005;
                        </button>
                    </div>
                ))}
            </div>

            <div className="editor-actions">
                <button className="waddle-btn" onClick={onCancel}>Cancel</button>
                <button
                    className="waddle-btn waddle-btn-primary"
                    onClick={handleSave}
                    disabled={saving || !title.trim() || questions.length === 0}
                >
                    {saving ? 'Saving...' : existingSet ? 'Update Set' : 'Create Set'}
                </button>
            </div>
        </div>
    );
}
