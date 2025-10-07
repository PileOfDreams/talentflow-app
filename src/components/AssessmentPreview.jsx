// The right panel on Assessments page, which lets users see changes to the form in real time
// Also simulates submission, assigning the form response to a random candidate
// Response then appears as an event in that candidate's timeline

import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { submitAssessment } from '../lib/api.js';
import Button from './Button.jsx';
import { Link } from 'react-router-dom';

const QuestionPreview = ({ question, index, register, errors, watchValues }) => {
  const conditional = question.conditional;
  if (conditional && conditional.questionId) {
    const dependentAnswer = watchValues[conditional.questionId];
    if (dependentAnswer !== conditional.requiredValue) {
      return null;
    }
  }

  const validationRules = {};
  if (question.required) {
    validationRules.required = "This field is required.";
  }
  if (question.maxLength && (question.type === 'short-text' || question.type === 'long-text')) {
    validationRules.maxLength = { 
      value: parseInt(question.maxLength, 10), 
      message: `Answer must be less than ${question.maxLength} characters.` 
    };
  }
  if (question.type === 'numeric') {
    if (question.min) validationRules.min = { value: parseFloat(question.min), message: `Value must be at least ${question.min}.` };
    if (question.max) validationRules.max = { value: parseFloat(question.max), message: `Value must be no more than ${question.max}.` };
  }

  const renderInput = () => {
    switch (question.type) {
      case 'single-choice':
        return (
          <div className="space-y-2 mt-2">
            {question.options?.map((option, i) => (
              <label key={i} className="flex items-center text-foreground/80">
                <input type="radio" {...register(question.id, validationRules)} value={option} className="mr-3 text-primary focus:ring-accent" /> {option}
              </label>
            ))}
          </div>
        );
      case 'multi-choice':
        return (
          <div className="space-y-2 mt-2">
            {question.options?.map((option, i) => (
              <label key={i} className="flex items-center text-foreground/80">
                <input type="checkbox" {...register(question.id, validationRules)} value={option} className="mr-3 rounded text-primary focus:ring-accent" /> {option}
              </label>
            ))}
          </div>
        );
      case 'numeric':
        return (
          <input
            type="number"
            {...register(question.id, validationRules)}
            min={question.min}
            max={question.max}
            placeholder={`Enter a number between ${question.min || '...'} and ${question.max || '...'}`}
            className="mt-2 w-full bg-muted text-foreground rounded-md p-2"
          />
        );
      case 'file-upload':
        return (
          <div className="mt-2">
            <input
              type="file"
              {...register(question.id, validationRules)}
              className="block w-full text-sm text-foreground/70
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-accent-foreground
                hover:file:bg-primary/90"
            />
          </div>
        );
      case 'long-text':
        return <textarea {...register(question.id, validationRules)} placeholder="Your answer..." className="mt-2 w-full bg-muted text-foreground rounded-md p-2 h-24" />;
      case 'short-text':
      default:
        return <input type="text" {...register(question.id, validationRules)} placeholder="Your answer..." className="mt-2 w-full bg-muted text-foreground rounded-md p-2" />;
    }
  };

  return (
    <div className="mb-6 transition-opacity duration-300">
      <label className="block font-medium text-foreground">
        {index + 1}. {question.text} 
        {question.required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {renderInput()}
      {errors[question.id] && <p className="text-red-400 text-sm mt-1">{errors[question.id].message}</p>}
    </div>
  );
};

export default function AssessmentPreview({ structure, assessmentId }) {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const watchValues = watch(); 
  const queryClient = useQueryClient();

  const submitMutation = useMutation({
    mutationFn: submitAssessment,
    onSuccess: (data) => {
      toast.success(
        (t) => (
          <span className="flex items-center">
            Submission assigned to {data.candidateName}!
            <Link to={`/candidates/${data.candidateId}`} className="ml-2 font-bold text-accent hover:underline" onClick={() => toast.dismiss(t.id)}>
              View Timeline
            </Link>
          </span>
        ), { duration: 6000 }
      );
      reset();
      queryClient.invalidateQueries({ queryKey: ['candidateTimeline', data.candidateId] });
    },
    onError: (error) => {
      toast.error(`Submission failed: ${error.message}`);
    },
  });

  if (!structure) return null;

  const onSubmit = (data) => {
    submitMutation.mutate({ 
      assessmentId, 
      responses: data 
    });
  };

  return (
    <div className="bg-secondary rounded-lg p-6 overflow-y-auto h-full">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Live Preview / Simulator</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-background/50 p-6 rounded-lg">
          <h1 className="text-2xl font-bold text-center mb-6 text-foreground">{structure.title}</h1>
          
          {structure.sections.map((section) => (
            <div key={section.id} className="mb-8">
              <h2 className="text-xl font-semibold border-b-2 border-primary pb-2 mb-4 text-foreground/90">{section.title}</h2>
              {section.questions.map((question, questionIndex) => (
                <QuestionPreview 
                  key={question.id} 
                  question={question} 
                  index={questionIndex} 
                  register={register} 
                  errors={errors} 
                  watchValues={watchValues} 
                />
              ))}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={submitMutation.isLoading}>
            {submitMutation.isLoading ? 'Submitting...' : 'Simulate Submission'}
          </Button>
        </div>
      </form>
    </div>
  );
}