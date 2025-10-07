// The left panel on Assessments page, which lets the user add, delete and edit questions across multiple sections

import React from 'react';
import { produce } from 'immer';
import { nanoid } from 'nanoid';
import { Plus, Trash2 } from 'lucide-react';
import Button from './Button';

const QUESTION_TYPES = ['single-choice', 'multi-choice', 'short-text', 'long-text', 'numeric', 'file-upload'];

export default function AssessmentBuilder({ structure, onUpdate }) {
  if (!structure) return null;
  
  const handleUpdate = (updater) => {
    onUpdate(produce(structure, updater));
  };

  const addSection = () => {
    handleUpdate(draft => {
      draft.sections.push({
        id: nanoid(),
        title: 'New Section',
        questions: [],
      });
    });
  };

  const addQuestion = (sectionIndex) => {
    handleUpdate(draft => {
      const questions = draft.sections[sectionIndex].questions;
      const lastQuestionType = questions.length > 0 ? questions[questions.length - 1].type : 'short-text';
      const newQuestion = {
        id: nanoid(),
        type: lastQuestionType,
        text: 'New Question',
      };
      if (newQuestion.type === 'numeric') {
        newQuestion.min = '';
        newQuestion.max = '';
      }
      questions.push(newQuestion);
    });
  };

  const updateQuestion = (sectionIndex, questionIndex, field, value) => {
    handleUpdate(draft => {
      const question = draft.sections[sectionIndex].questions[questionIndex];
      question[field] = value;
      if (field === 'type' && value === 'numeric') {
        if (question.min === undefined) question.min = '';
        if (question.max === undefined) question.max = '';
      }
    });
  };

  const deleteQuestion = (sectionIndex, questionIndex) => {
    handleUpdate(draft => {
      draft.sections[sectionIndex].questions.splice(questionIndex, 1);
    });
  };

  const deleteSection = (sectionIndex) => {
    handleUpdate(draft => {
      draft.sections.splice(sectionIndex, 1);
    });
  };

  const addOption = (sectionIndex, questionIndex) => {
    handleUpdate(draft => {
      const question = draft.sections[sectionIndex].questions[questionIndex];
      if (!question.options) question.options = [];
      question.options.push('New Option');
    });
  };

  const updateOption = (sectionIndex, questionIndex, optionIndex, value) => {
    handleUpdate(draft => {
      draft.sections[sectionIndex].questions[questionIndex].options[optionIndex] = value;
    });
  };

  const deleteOption = (sectionIndex, questionIndex, optionIndex) => {
    handleUpdate(draft => {
      draft.sections[sectionIndex].questions[questionIndex].options.splice(optionIndex, 1);
    });
  };

  return (
    <div className="bg-secondary rounded-lg p-4 overflow-y-auto h-full">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Builder</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground/80 mb-1">Assessment Title</label>
        <input
          type="text"
          value={structure.title || ''}
          onChange={(e) => handleUpdate(draft => { draft.title = e.target.value; })}
          className="w-full bg-muted text-foreground rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {structure.sections.map((section, sectionIndex) => (
        <div key={section.id} className="bg-background/50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-center mb-3">
            <input
              type="text"
              value={section.title}
              onChange={(e) => handleUpdate(draft => { draft.sections[sectionIndex].title = e.target.value; })}
              className="text-lg font-semibold bg-transparent w-full focus:outline-none focus:bg-muted rounded p-1"
            />
            <button onClick={() => deleteSection(sectionIndex)} className="text-red-400 hover:text-red-300"><Trash2 size={18} /></button>
          </div>

          {section.questions.map((question, questionIndex) => (
            <div key={question.id} className="bg-muted p-3 rounded-md mb-3">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'text', e.target.value)}
                  className="bg-transparent w-full focus:outline-none focus:bg-secondary rounded p-1"
                />
                <button onClick={() => deleteQuestion(sectionIndex, questionIndex)} className="text-red-400 hover:text-red-300 ml-2"><Trash2 size={16} /></button>
              </div>

              {(() => {
                const sortedQuestionTypes = [question.type, ...QUESTION_TYPES.filter(t => t !== question.type)];
                return (
                  <select
                    value={question.type}
                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'type', e.target.value)}
                    className="w-full bg-secondary text-foreground rounded-md p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-accent"
                  >
                    {sortedQuestionTypes.map(type => <option key={type} value={type}>{type.replace('-', ' ')}</option>)}
                  </select>
                );
              })()}

              <div className="bg-secondary/50 p-2 rounded-md mt-2 space-y-2">
                <h4 className="text-xs font-bold text-foreground/70">Validation & Logic</h4>

                <label className="flex items-center gap-2 text-sm text-foreground/80">
                  <input
                    type="checkbox"
                    checked={!!question.required}
                    onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'required', e.target.checked)}
                    className="rounded text-primary focus:ring-accent"
                  />
                  Required
                </label>

                {(question.type === 'short-text' || question.type === 'long-text') && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-foreground/80">Max Length:</label>
                    <input
                      type="number"
                      placeholder="e.g., 100"
                      value={question.maxLength || ''}
                      onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'maxLength', e.target.value)}
                      className="bg-secondary text-sm w-20 focus:outline-none focus:bg-muted rounded p-1"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm text-foreground/80">
                  <input
                    type="checkbox"
                    checked={!!question.conditional}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const newConditional = isChecked ? { questionId: '', requiredValue: '' } : undefined;
                      updateQuestion(sectionIndex, questionIndex, 'conditional', newConditional);
                    }}
                    className="rounded text-primary focus:ring-accent"
                  />
                  Conditional Logic
                </label>

                {question.conditional && (
                  <div className="pl-6 space-y-2">
                    <p className="text-xs text-foreground/70">Show this question if...</p>
                    <select
                      value={question.conditional.questionId || ''}
                      onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'conditional', { ...question.conditional, questionId: e.target.value })}
                      className="w-full bg-secondary text-foreground text-sm rounded-md p-1"
                    >
                      <option value="" disabled>Select a question...</option>
                      {structure.sections.flatMap(s => s.questions)
                        .filter(q => q.id !== question.id)
                        .map(q => <option key={q.id} value={q.id}>{q.text.substring(0, 30)}...</option>)
                      }
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">equals:</span>
                      <input
                        type="text"
                        placeholder="e.g., Yes"
                        value={question.conditional.requiredValue || ''}
                        onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'conditional', { ...question.conditional, requiredValue: e.target.value })}
                        className="bg-secondary text-sm w-full focus:outline-none focus:bg-muted rounded p-1"
                      />
                    </div>
                  </div>
                )}
              </div>

              {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                <div className="pl-4 mt-2">
                  {question.options?.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center mb-1">
                      <input type="text" value={option} onChange={(e) => updateOption(sectionIndex, questionIndex, optionIndex, e.target.value)}
                        className="bg-secondary text-sm w-full focus:outline-none focus:bg-muted rounded p-1" />
                      <button onClick={() => deleteOption(sectionIndex, questionIndex, optionIndex)} className="text-red-400 hover:text-red-300 ml-2"><Trash2 size={14} /></button>
                    </div>
                  ))}
                  <Button variant="secondary" onClick={() => addOption(sectionIndex, questionIndex)}><Plus size={14} className="mr-1"/> Add Option</Button>
                </div>
              )}

              {question.type === 'numeric' && (
                <div className="pl-4 mt-2 flex items-center gap-4">
                  <div>
                    <label className="text-xs text-foreground/70">Min</label>
                    <input type="number" value={question.min || ''} onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'min', e.target.value)}
                      className="bg-secondary text-sm w-full focus:outline-none focus:bg-muted rounded p-1" />
                  </div>
                  <div>
                    <label className="text-xs text-foreground/70">Max</label>
                    <input type="number" value={question.max || ''} onChange={(e) => updateQuestion(sectionIndex, questionIndex, 'max', e.target.value)}
                      className="bg-secondary text-sm w-full focus:outline-none focus:bg-muted rounded p-1" />
                  </div>
                </div>
              )}
            </div>
          ))}
          <Button onClick={() => addQuestion(sectionIndex)}><Plus size={16} className="mr-2"/> Add Question</Button>
        </div>
      ))}
      <Button onClick={addSection}><Plus size={16} className="mr-2"/> Add Section</Button>
    </div>
  );
}