// Allows drag-and-drop functionality on Candidates page
// Basically, it's the 'Board' view

import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Link } from 'react-router-dom';

// These semantic colors are intentionally kept separate from the main theme
// as they represent specific statuses (Applied, Screen, Hired, etc.).
const stageColors = {
  applied: '#3B82F6', // blue-500
  screen: '#0EA5E9', // sky-500
  tech: '#6366F1', // indigo-500
  offer: '#A855F7', // purple-500
  hired: '#22C55E', // green-500
  rejected: '#EF4444', // red-500
};

export default function KanbanBoard({ candidatesByStage, onDragEnd, searchParamsString }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-2">
        {Object.entries(candidatesByStage).map(([stage, candidates]) => (
          <Droppable key={stage} droppableId={stage}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-shrink-0 w-72 bg-secondary rounded-lg shadow-md transition-colors ${
                  snapshot.isDraggingOver ? 'bg-muted/50' : ''
                }`}
              >
                <div 
                  className="p-3 border-b-4" 
                  style={{ borderBottomColor: stageColors[stage] || 'var(--color-muted)' }}
                >
                  <h3 className="font-semibold text-foreground capitalize">{stage}</h3>
                  <span className="text-sm text-foreground/70">{candidates.length} candidates</span>
                </div>
                <div className="p-2 space-y-2 min-h-[100px] overflow-y-auto max-h-[calc(100vh-250px)]">
                  {candidates.map((candidate, index) => (
                    <Draggable key={candidate.id} draggableId={candidate.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <Link
                          to={{ pathname: `/candidates/${candidate.id}`, search: searchParamsString }}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`block bg-background p-3 rounded-md shadow-sm hover:bg-muted/50 transition-colors ${
                            snapshot.isDragging ? 'ring-2 ring-accent' : ''
                          }`}
                        >
                          <div>
                            <p className="font-medium text-foreground">{candidate.name}</p>
                            <p className="text-xs text-foreground/70 truncate">{candidate.email}</p>
                          </div>
                        </Link>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}