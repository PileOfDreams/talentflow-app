// All fetch calls are defined here
// Lets us separate the UI layer (pages, components) from the data-fetching layer (MSW, handlers for MSW)

// --- JOB FUNCTIONS ---
export async function fetchJobs({ queryKey }) {
  const [_key, paramsObj] = queryKey;
  const params = new URLSearchParams(paramsObj);
  const response = await fetch(`/jobs?${params.toString()}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function fetchJobById({ queryKey }) {
  const [_key, { jobId }] = queryKey;
  const response = await fetch(`/jobs/${jobId}`);
  if (!response.ok) throw new Error('Failed to fetch job');
  return response.json();
}

export async function fetchTags() {
  const response = await fetch('/tags');
  if (!response.ok) throw new Error('Failed to fetch tags');
  return response.json();
}

export async function createJob(jobData) {
  const response = await fetch('/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jobData) });
  if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to create job'); }
  return response.json();
}

export async function updateJob({ id, ...jobData }) {
  const response = await fetch(`/jobs/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jobData) });
  if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to update job'); }
  return response.json();
}

export async function reorderJobs(variables) {
  const response = await fetch('/jobs/reorder', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(variables) });
  if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to reorder jobs'); }
  return response.json();
}

// --- CANDIDATE FUNCTIONS ---
export async function fetchCandidates({ queryKey }) {
  const [_key, paramsObj] = queryKey;
  const params = new URLSearchParams(paramsObj);
  const response = await fetch(`/candidates?${params.toString()}`);
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json(); 
}

export async function updateCandidateStage({ id, stage }) {
  const response = await fetch(`/candidates/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage }) });
  if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to update candidate stage'); }
  return response.json();
}

export async function fetchCandidateById({ queryKey }) {
  const [_key, candidateId] = queryKey;
  const response = await fetch(`/candidates/${candidateId}`);
  if (!response.ok) throw new Error('Failed to fetch candidate');
  return response.json();
}

export async function fetchCandidateTimeline({ queryKey }) {
  const [_key, candidateId] = queryKey;
  const response = await fetch(`/candidates/${candidateId}/timeline`);
  if (!response.ok) throw new Error('Failed to fetch timeline');
  return response.json();
}

export async function addNoteToCandidate({ candidateId, content }) {
  const response = await fetch(`/candidates/${candidateId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add note');
  }
  return response.json();
}

export async function fetchSampleCandidates() {
  const response = await fetch('/candidates/sample');
  if (!response.ok) throw new Error('Failed to fetch sample candidates');
  return response.json();
}

// --- ASSESSMENT FUNCTIONS ---
export async function fetchAssessment({ queryKey }) {
  const [_key, paramsObj] = queryKey;
  const params = new URLSearchParams(paramsObj);
  const response = await fetch(`/assessments/${params.get('jobId')}`);
  if (!response.ok) throw new Error('Failed to fetch assessment');
  return response.json();
}

export async function saveAssessment({ jobId, assessmentData }) {
  const response = await fetch(`/assessments/${jobId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(assessmentData) });
  if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.message || 'Failed to save assessment'); }
  return response.json();
}

export async function submitAssessment({ assessmentId, responses }) {
  const response = await fetch(`/assessments/${assessmentId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit assessment');
  }
  return response.json();
}

export async function fetchAssessmentResponse({ responseId }) {
  const response = await fetch(`/assessment-responses/${responseId}`);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to fetch assessment response');
  }
  return response.json();
}