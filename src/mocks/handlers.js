// Handles all the logic for our MSW's responses to various GET, POST and PATCH calls

import { http, HttpResponse } from 'msw';
import { db } from '../api/db';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export const handlers = [

  // --- JOB HANDLERS ---

  http.get('/jobs', async ({ request }) => {
  await delay(Math.random() * (600 - 200) + 200);
  const url = new URL(request.url);
  const unpaginated = url.searchParams.get('unpaginated') === 'true';
  const search = url.searchParams.get('search')?.toLowerCase() || '';
  const status = url.searchParams.get('status') || 'all';
  const tagsParam = url.searchParams.get('tags');
  const selectedTags = tagsParam ? tagsParam.split(',') : [];
  let allJobs = await db.jobs.orderBy('order').toArray();
  if (status !== 'all') {
    allJobs = allJobs.filter(job => job.status === status);
  }
if (selectedTags.length > 0) {
  allJobs = allJobs.filter(job => {
    // A job must have tags to be considered.
    if (!job.tags || job.tags.length === 0) {
      return false;
    }
    return selectedTags.every(selectedTag => job.tags.includes(selectedTag));
  });
}
  const filteredJobs = search 
    ? allJobs.filter(job => job.title.toLowerCase().includes(search)) 
    : allJobs;
  if (unpaginated) {
    return HttpResponse.json({ jobs: filteredJobs, totalCount: filteredJobs.length });
  }
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
  const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);
  return HttpResponse.json({ jobs: paginatedJobs, totalCount: filteredJobs.length, page, pageSize });
}),

  // Gets tags for a job
  http.get('/tags', async () => {
  await delay(200);
  const allJobs = await db.jobs.toArray();
  // Using a Set to automatically handle uniqueness
  const allTags = new Set(allJobs.flatMap(job => job.tags));
  return HttpResponse.json(Array.from(allTags).sort());
}),

  http.post('/jobs', async ({ request }) => {
    await delay(Math.random() * (800 - 300) + 300);
    const newJobData = await request.json();
    if (!newJobData.title || newJobData.title.trim() === '') return HttpResponse.json({ message: 'Title is required' }, { status: 400 });
    const slug = newJobData.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const existingJob = await db.jobs.where('slug').equals(slug).first();
    if (existingJob) return HttpResponse.json({ message: 'A job with this title already exists.' }, { status: 400 });
  const newJob = { 
  title: newJobData.title.trim(), 
  slug, 
  status: 'active', 
  tags: newJobData.tags || [], // Default to an empty array
  description: newJobData.description || '', // Default to an empty string
  order: (await db.jobs.count()) + 1 
};    const id = await db.jobs.add(newJob);
    return HttpResponse.json({ ...newJob, id }, { status: 201 });
  }),

  http.patch('/jobs/reorder', async ({ request }) => {
    await delay(Math.random() * (1000 - 400) + 400);
    if (Math.random() < 0.2) return HttpResponse.json({ message: 'Failed to save new order.' }, { status: 500 });
    const { fromId, toIndex } = await request.json();
    const allJobs = await db.jobs.orderBy('order').toArray();
    const fromIndex = allJobs.findIndex(job => job.id === fromId);
    if (fromIndex === -1) return HttpResponse.json({ message: 'Job to move not found.' }, { status: 404 });
    const [movedJob] = allJobs.splice(fromIndex, 1);
    allJobs.splice(toIndex, 0, movedJob);
    const updatedJobs = allJobs.map((job, index) => ({ ...job, order: index + 1 }));
    await db.jobs.bulkPut(updatedJobs);
    return HttpResponse.json({ success: true });
  }),

http.get('/jobs/:id(\\d+)', async ({ params }) => {
  await delay(300);
  const jobId = parseInt(params.id, 10);
  const job = await db.jobs.where('id').equals(jobId).first();

  if (job) {
    return HttpResponse.json(job);
  }
  return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
}),

  http.patch('/jobs/:id(\\d+)', async ({ request, params }) => {
    await delay(Math.random() * (800 - 300) + 300);
    const jobId = parseInt(params.id, 10);
    const updatedData = await request.json();
    const job = await db.jobs.where('id').equals(jobId).first();
    if (!job) return HttpResponse.json({ message: 'Job not found' }, { status: 404 });
    if (updatedData.title) {
      const newSlug = updatedData.title.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const existingJob = await db.jobs.where('slug').equals(newSlug).first();
      if (existingJob && existingJob.id !== jobId) return HttpResponse.json({ message: 'Another job with this title already exists.' }, { status: 400 });
      updatedData.slug = newSlug;
    }
    await db.jobs.update(jobId, updatedData);
    const updatedJob = await db.jobs.where('id').equals(jobId).first();
    return HttpResponse.json(updatedJob);
  }),

  // --- CANDIDATE HANDLERS ---
  
  http.get('/candidates', async ({ request }) => {
    await delay(Math.random() * (600 - 200) + 200);
    const url = new URL(request.url);
    const stage = url.searchParams.get('stage') || 'all';
    let allCandidates = await db.candidates.orderBy('name').toArray();
    if (stage && stage !== 'all') {
      allCandidates = allCandidates.filter(c => c.stage === stage);
    }
    return HttpResponse.json(allCandidates);
  }),

http.get('/candidates/sample', async () => {
  await delay(500);
  const allCandidates = await db.candidates.toArray();
  const shuffled = [...allCandidates].sort(() => 0.5 - Math.random());
  return HttpResponse.json(shuffled.slice(0, 10)); 
}),

  http.get('/candidates/:id(\\d+)/timeline', async ({ params }) => {
    await delay(Math.random() * (400 - 100) + 100);
    const candidateId = parseInt(params.id, 10);
    const events = await db.timelineEvents.where('candidateId').equals(candidateId).reverse().sortBy('timestamp');
    return HttpResponse.json(events);
  }),

  http.get('/candidates/:id(\\d+)', async ({ params }) => {
    await delay(Math.random() * (400 - 100) + 100);
    const candidateId = parseInt(params.id, 10);
    const candidate = await db.candidates.where('id').equals(candidateId).first();
    if (candidate) {
      const job = await db.jobs.where('id').equals(candidate.jobId).first();
      return HttpResponse.json({ ...candidate, jobTitle: job?.title || 'N/A' });
    }
    return HttpResponse.json({ message: 'Candidate not found' }, { status: 404 });
  }),

http.post('/candidates/:id(\\d+)/notes', async ({ request, params }) => {
  await delay(600);
  if (Math.random() < 0.1) return HttpResponse.json({ message: 'Failed to save note.' }, { status: 500 });
  const candidateId = parseInt(params.id, 10);
  const { content } = await request.json();
  if (!content || content.trim() === '') {
    return HttpResponse.json({ message: 'Note content cannot be empty.' }, { status: 400 });
  }
  const newNoteEvent = {
    candidateId,
    type: 'note',
    content: content,
    author: 'HR Manager', // In a real app, this would be the logged in user
    timestamp: new Date(),
  };
  const id = await db.timelineEvents.add(newNoteEvent);
  return HttpResponse.json({ ...newNoteEvent, id }, { status: 201 });
}),

  http.patch('/candidates/:id(\\d+)', async ({ request, params }) => {
    await delay(Math.random() * (800 - 300) + 300);
    if (Math.random() < 0.1) return HttpResponse.json({ message: 'A random server error occurred.' }, { status: 500 });
    const candidateId = parseInt(params.id, 10);
    const { stage } = await request.json();
    if (!stage) return HttpResponse.json({ message: 'Stage is required.' }, { status: 400 });
    const candidate = await db.candidates.where('id').equals(candidateId).first();
    if (!candidate) return HttpResponse.json({ message: 'Candidate not found.' }, { status: 404 });
    const oldStage = candidate.stage;
    await db.candidates.update(candidateId, { stage });
    await db.timelineEvents.add({
      candidateId, type: 'stage_change',
      content: `Moved from ${oldStage.charAt(0).toUpperCase() + oldStage.slice(1)} to ${stage.charAt(0).toUpperCase() + stage.slice(1)}`,
      author: 'System', timestamp: new Date(),
    });
    const updatedCandidate = await db.candidates.where('id').equals(candidateId).first();
    return HttpResponse.json(updatedCandidate);
  }),

  // --- ASSESSMENT HANDLERS ---

http.get('/assessment-responses/:responseId(\\d+)', async ({ params }) => {
  await delay(500);
  const responseId = parseInt(params.responseId, 10);
  const response = await db.assessmentResponses.where('id').equals(responseId).first();
  if (!response) return HttpResponse.json({ message: 'Response not found.' }, { status: 404 });
  const assessment = await db.assessments.where('id').equals(response.assessmentId).first();
  if (!assessment) return HttpResponse.json({ message: 'Associated assessment not found.' }, { status: 404 });
  return HttpResponse.json({
    structure: assessment.structure,
    responses: JSON.parse(response.responses || '{}'),
  });
}),

http.get('/assessments/:jobId(\\d+)', async ({ params }) => {
  await delay(400);
  const jobId = parseInt(params.jobId, 10);
  const assessment = await db.assessments.where('jobId').equals(jobId).first();
  if (assessment) {
    return HttpResponse.json(assessment);
  }
  return HttpResponse.json({
    jobId,
    structure: { title: 'New Assessment', sections: [] }
  });
}),

  http.put('/assessments/:jobId(\\d+)', async ({ request, params }) => {
    await delay(800);
    if (Math.random() < 0.1) return HttpResponse.json({ message: 'Failed to save assessment.' }, { status: 500 });
    const jobId = parseInt(params.jobId, 10);
    const newStructure = await request.json();
    const existingAssessment = await db.assessments.where('jobId').equals(jobId).first();
    if (existingAssessment) {
      await db.assessments.update(existingAssessment.id, { structure: newStructure });
    } else {
      await db.assessments.add({ jobId, structure: newStructure });
    }
    return HttpResponse.json({ success: true });
  }),

http.post('/assessments/:assessmentId/submit', async ({ request, params }) => {
  await delay(800);
  if (Math.random() < 0.1) return HttpResponse.json({ message: 'A random server error occurred.' }, { status: 500 });
  const assessmentId = parseInt(params.assessmentId, 10);
  const { responses } = await request.json();
  // Get all candidate IDs and pick one at random
  const allCandidates = await db.candidates.toArray();
  const allCandidateIds = allCandidates.map(c => c.id);
  const randomCandidateId = allCandidateIds[Math.floor(Math.random() * allCandidateIds.length)];
  const assignedCandidate = await db.candidates.where('id').equals(randomCandidateId).first();
  // Get the assessment title for our timeline event
  const assessment = await db.assessments.where('id').equals(assessmentId).first();
  const assessmentTitle = assessment?.structure?.title || 'an assessment';
  // Save the response data to the database
  const responseId = await db.assessmentResponses.add({
    assessmentId,
    candidateId: randomCandidateId,
    responses: JSON.stringify(responses), // Store the answers as a JSON string
    submittedAt: new Date(),
  });

  // Create a timeline event to announce the submission
  await db.timelineEvents.add({
    candidateId: randomCandidateId,
    type: 'assessment_completed',
    content: `Completed the "${assessmentTitle}" assessment.`,
    author: assignedCandidate.name, // Use the candidate's name as the author
    assessmentId,
    responseId,
    timestamp: new Date(),
  });

  // Return a success response with the candidate's details for the toast notification
  return HttpResponse.json({ 
    success: true, 
    candidateId: randomCandidateId,
    candidateName: assignedCandidate.name,
  });
}),
];