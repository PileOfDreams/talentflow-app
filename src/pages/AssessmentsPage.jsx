import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { fetchJobs, fetchAssessment, saveAssessment } from '../lib/api.js';
import Spinner from '../components/Spinner.jsx';
import Button from '../components/Button.jsx';
import AssessmentBuilder from '../components/AssessmentBuilder.jsx';
import AssessmentPreview from '../components/AssessmentPreview.jsx';

export default function AssessmentsPage() {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [assessmentStructure, setAssessmentStructure] = useState(null);
  const queryClient = useQueryClient();

  const { data: jobsData, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['jobs', { status: 'active', unpaginated: true }],
    queryFn: fetchJobs,
  });

  const { data: assessmentData, isLoading: isLoadingAssessment } = useQuery({
    queryKey: ['assessment', { jobId: selectedJobId }],
    queryFn: fetchAssessment,
    enabled: !!selectedJobId,
  });
  
  useEffect(() => {
    if (assessmentData) {
      setAssessmentStructure(assessmentData.structure);
    } else {
      setAssessmentStructure(null);
    }
  }, [assessmentData]);

  const saveMutation = useMutation({
    mutationFn: saveAssessment,
    onSuccess: () => {
      toast.success('Assessment saved successfully!');
      queryClient.invalidateQueries(['assessment', { jobId: selectedJobId }]);
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    }
  });

  const handleSave = () => {
    if (!assessmentStructure) return;
    saveMutation.mutate({ jobId: selectedJobId, assessmentData: assessmentStructure });
  };

  const jobs = jobsData?.jobs || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Assessment Builder</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="bg-muted text-foreground rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent min-w-[200px]"
          >
            <option value="" disabled>Select a Job...</option>
            {isLoadingJobs ? <option>Loading jobs...</option> : jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <Button onClick={handleSave} disabled={!selectedJobId || saveMutation.isLoading || !assessmentStructure}>
            {saveMutation.isLoading ? 'Saving...' : 'Save Assessment'}
          </Button>
        </div>
      </div>
      
      {selectedJobId ? (
        (isLoadingAssessment && !assessmentStructure) ? <Spinner /> : (
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-8 overflow-hidden">
            <AssessmentBuilder structure={assessmentStructure} onUpdate={setAssessmentStructure} />
            <AssessmentPreview 
              structure={assessmentStructure}
              assessmentId={assessmentData?.id} 
            />
          </div>
        )
      ) : (
        <div className="flex-grow flex items-center justify-center bg-secondary rounded-lg">
          <p className="text-foreground/50">Please select a job to build an assessment.</p>
        </div>
      )}
    </div>
  );
}