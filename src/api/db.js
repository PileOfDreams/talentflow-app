import Dexie from 'dexie';

// Initialize Dexie and define the database schema.
export const db = new Dexie('talentflow');

db.version(1).stores({
  // The '++id' auto-increments the primary key.
  // The other properties are indexes for efficient querying.
  jobs: '++id, slug, status, order',
  candidates: '++id, jobId, stage, name, email',
  timelineEvents: '++id, candidateId, type, timestamp', 
  assessments: '++id, jobId',
  assessmentResponses: '++id, assessmentId, candidateId', 
});
