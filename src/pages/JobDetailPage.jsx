// The deep link for a job, containing its title, status, tags and job description 

import React from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchJobById } from '../lib/api';
import Spinner from '../components/Spinner.jsx';
import { ArrowLeft, Tag } from 'lucide-react';

export default function JobDetailPage() {
  const { jobId } = useParams();
  const location = useLocation();

  const { data: job, isLoading, isError } = useQuery({
    queryKey: ['job', { jobId }],
    queryFn: fetchJobById,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Failed to load job data.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full overflow-y-auto">
      <div className="mb-6">
        <Link 
          to={`/jobs${location.search}`} 
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Job Postings
        </Link>
      </div>

      <div className="bg-secondary rounded-lg p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-foreground">{job.title}</h1>
          <p className={`text-sm font-medium inline-block px-3 py-1 rounded-full ${
            job.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </p>
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {job.tags.map(tag => (
              <span key={tag} className="flex items-center bg-muted text-foreground/80 text-xs font-medium px-2.5 py-1 rounded-full">
                <Tag size={12} className="mr-1.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-6 border-t border-muted pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Job Description</h2>
          <div className="prose prose-invert max-w-none text-foreground/80 whitespace-pre-wrap">
            {job.description}
          </div>
        </div>
      </div>
    </div>
  );
}