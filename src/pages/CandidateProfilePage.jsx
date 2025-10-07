// Deep link for a candidate

import React, { useState, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { fetchCandidateById, fetchCandidateTimeline, fetchAssessmentResponse, addNoteToCandidate } from '../lib/api';
import Spinner from '../components/Spinner.jsx';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
import { ArrowLeft, MessageSquare, ArrowRightCircle, FileText } from 'lucide-react';
import MentionSuggestions from '../components/MentionSuggestions.jsx';

// A fictitious HR team, whose members we can '@' when adding notes to a candidate's timeline
const TEAMMATES = [
  { id: 1, name: 'Percy Jackson', username: 'percy' },
  { id: 2, name: 'Julian', username: 'julian' },
  { id: 3, name: 'Hazel Underwood', username: 'hazy' },
  { id: 4, name: 'Leo Valdez', username: 'leo' },
  { id: 5, name: 'Piper Mclean', username: 'piper' },
  { id: 6, name: 'Frank Underwood', username: 'frankie' },
  { id: 7, name: 'Annabeth Chase', username: 'anna' },
];

const NoteRenderer = ({ content }) => {
  const parts = content.split(/(\s+)/);
  return (
    <p className="text-foreground break-words">
      {parts.map((part, index) => 
        part.startsWith('@') ? (
          <strong key={index} className="text-accent font-medium">{part}</strong>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </p>
  );
};

export default function CandidateProfilePage() {
  const { candidateId } = useParams();
  const location = useLocation();
  const [modalState, setModalState] = useState({ isOpen: false, data: null, isLoading: false });
  const [noteContent, setNoteContent] = useState('');
  const [mentionState, setMentionState] = useState({ show: false, query: '', position: null, suggestions: [] });
  const textareaRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: candidate, isLoading: isLoadingCandidate, isError: isErrorCandidate } = useQuery({
    queryKey: ['candidate', candidateId],
    queryFn: fetchCandidateById,
  });

  const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['candidateTimeline', candidateId],
    queryFn: fetchCandidateTimeline,
  });
  
  const viewResponseMutation = useMutation({
    mutationFn: fetchAssessmentResponse,
    onMutate: () => setModalState({ isOpen: true, data: null, isLoading: true }),
    onSuccess: (data) => setModalState({ isOpen: true, data, isLoading: false }),
    onError: (error) => {
      toast.error(`Failed to load response: ${error.message}`);
      setModalState({ isOpen: false, data: null, isLoading: false });
    },
  });

  const addNoteMutation = useMutation({
    mutationFn: addNoteToCandidate,
    onMutate: async ({ content }) => {
      setNoteContent('');
      await queryClient.cancelQueries({ queryKey: ['candidateTimeline', candidateId] });
      const previousTimeline = queryClient.getQueryData(['candidateTimeline', candidateId]);
      queryClient.setQueryData(['candidateTimeline', candidateId], (old = []) => [
        { id: `temp-${Date.now()}`, type: 'note', content, author: 'You', timestamp: new Date() },
        ...old,
      ]);
      return { previousTimeline };
    },
    onError: (err, variables, context) => {
      toast.error(`Failed to save note: ${err.message}`);
      if (context.previousTimeline) {
        queryClient.setQueryData(['candidateTimeline', candidateId], context.previousTimeline);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidateTimeline', candidateId] });
    },
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (noteContent.trim()) {
      addNoteMutation.mutate({ candidateId, content: noteContent.trim() });
    }
  };

  const handleNoteChange = (e) => {
    const text = e.target.value;
    setNoteContent(text);
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const suggestions = TEAMMATES.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.username.toLowerCase().includes(query)
      );
      const rect = textareaRef.current.getBoundingClientRect();
      setMentionState({
        show: suggestions.length > 0,
        query,
        suggestions,
        position: { top: rect.bottom + window.scrollY, left: rect.left + window.scrollX },
      });
    } else {
      setMentionState({ show: false, query: '', suggestions: [], position: null });
    }
  };

  const handleSelectMention = (username) => {
    const text = noteContent;
    const cursorPos = textareaRef.current.selectionStart;
    const textBeforeCursor = text.slice(0, cursorPos);
    const textAfterCursor = text.slice(cursorPos);
    const newTextBefore = textBeforeCursor.replace(/@(\w*)$/, `@${username} `);
    setNoteContent(newTextBefore + textAfterCursor);
    setMentionState({ show: false, query: '', suggestions: [], position: null });
    textareaRef.current.focus();
  };

  if (isLoadingCandidate || !candidate) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (isErrorCandidate) {
    return <div className="p-8 text-center text-red-500">Failed to load candidate data.</div>;
  }

  const renderResponseModal = () => (
    <Modal 
      title={modalState.data?.structure?.title || 'Assessment Responses'}
      isOpen={modalState.isOpen}
      onClose={() => setModalState({ isOpen: false, data: null, isLoading: false })}
    >
      {modalState.isLoading ? <Spinner /> : modalState.data && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {modalState.data.structure.sections.flatMap(section => section.questions).map((question) => (
            <div key={question.id} className="bg-muted p-3 rounded-md">
              <p className="font-semibold text-foreground/80">{question.text}</p>
              <p className="text-foreground text-lg mt-1 break-words">
                {(() => {
                  const response = modalState.data.responses[question.id];
                  if (Array.isArray(response)) return response.join(', ');
                  return response || <span className="text-foreground/50 italic">No answer provided</span>;
                })()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      {renderResponseModal()}
      
      <div className="mb-6">
        <Link 
          to={`/candidates${location.search}`} 
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Candidates
        </Link>
      </div>
      
      <div className="flex items-center gap-6 mb-8">
        <img src={`https://i.pravatar.cc/80?u=${candidate.email}`} alt={candidate.name} className="w-20 h-20 rounded-full border-4 border-muted" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">{candidate.name}</h1>
          <p className="text-foreground/70">{candidate.email}</p>
          <p className="text-foreground/70">Applying for: <span className="font-medium text-foreground/90">{candidate.jobTitle}</span></p>
        </div>
      </div>

      <div className="relative mb-8">
        <form onSubmit={handleAddNote}>
          <textarea
            ref={textareaRef}
            value={noteContent}
            onChange={handleNoteChange}
            placeholder="Add a note... use @ to mention teammates."
            className="w-full bg-muted border border-secondary rounded-md shadow-sm p-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            rows="3"
          />
          <div className="mt-2 flex justify-end">
            <Button type="submit" disabled={addNoteMutation.isLoading || !noteContent.trim()}>
              {addNoteMutation.isLoading ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </form>
        {mentionState.show && (
          <MentionSuggestions 
            suggestions={mentionState.suggestions}
            onSelect={handleSelectMention}
            position={mentionState.position}
          />
        )}
      </div>
      
      <h2 className="text-xl font-semibold text-foreground mb-4">Activity Timeline</h2>
      <div className="flex-grow overflow-auto bg-secondary rounded-lg p-4 space-y-4">
        {isLoadingTimeline ? <Spinner /> : (
          timeline?.map(event => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="bg-muted rounded-full p-2">
                  {event.type === 'assessment_completed' ? <FileText size={16} className="text-green-400" /> :
                   event.type === 'note' ? <MessageSquare size={16} className="text-foreground/70" /> : 
                   <ArrowRightCircle size={16} className="text-primary" />}
                </div>
                <div className="flex-grow w-px bg-muted last:hidden"></div>
              </div>
              <div className="pb-4 flex-grow">
                {event.type === 'note' ? <NoteRenderer content={event.content} /> : <p className="text-foreground">{event.content}</p>}
                
                {event.type === 'assessment_completed' && event.responseId && (
                  <div className="mt-2">
                    <Button 
                      variant="secondary" 
                      onClick={() => viewResponseMutation.mutate({ responseId: event.responseId })}
                      disabled={viewResponseMutation.isLoading}
                    >
                      View Responses
                    </Button>
                  </div>
                )}

                <p className="text-xs text-foreground/50 mt-2">
                  {new Date(event.timestamp).toLocaleString()} by {event.author}
                </p>
              </div>
            </div>
          ))
        )}
         {!isLoadingTimeline && timeline?.length === 0 && (
          <p className="text-center text-foreground/50">No timeline events yet.</p>
        )}
      </div>
    </div>
  );
}