import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { fetchJobs, createJob, updateJob, reorderJobs, fetchTags } from '../lib/api.js';
import { ChevronLeft, ChevronRight, Search, Plus, Edit } from 'lucide-react';
import Spinner from '../components/Spinner.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import MultiSelect from '../components/MultiSelect.jsx';
import TagInput from '../components/TagInput.jsx';

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  const [modalState, setModalState] = React.useState({ mode: 'closed' });

  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      status: 'active',
      description: '',
      tags: [],
    }
  });
  
  const filters = { 
    page, 
    search, 
    status, 
    tags: selectedTags.join(',') 
  };
  
  const { data: allTags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  useEffect(() => {
    if (modalState.mode === 'edit' && modalState.job) {
      setValue('title', modalState.job.title);
      setValue('status', modalState.job.status);
      setValue('description', modalState.job.description || '');
      setValue('tags', modalState.job.tags || []);
    } else {
      reset();
    }
  }, [modalState, setValue, reset]);

  const { data, isLoading, isError, error: queryError } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: fetchJobs,
    keepPreviousData: true,
  });
  
  const updateSearchParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const commonMutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setModalState({ mode: 'closed' });
    },
    onError: (error) => toast.error(`Error: ${error.message}`),
  };

  const createJobMutation = useMutation({ mutationFn: createJob, ...commonMutationOptions });
  const updateJobMutation = useMutation({ mutationFn: updateJob, ...commonMutationOptions });
  const reorderJobsMutation = useMutation({
    mutationFn: reorderJobs,
    onMutate: async ({ localFromIndex, localToIndex }) => {
      await queryClient.cancelQueries({ queryKey: ['jobs', filters] });
      const previousJobsData = queryClient.getQueryData(['jobs', filters]);
      queryClient.setQueryData(['jobs', filters], (oldData) => {
        const newJobs = Array.from(oldData.jobs);
        const [movedJob] = newJobs.splice(localFromIndex, 1);
        newJobs.splice(localToIndex, 0, movedJob);
        return { ...oldData, jobs: newJobs };
      });
      return { previousJobsData };
    },
    onError: (err, variables, context) => {
      toast.error('Failed to save order. Reverting changes.');
      if (context?.previousJobsData) queryClient.setQueryData(['jobs', filters], context.previousJobsData);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['jobs', filters] }),
  });

  const handleOnDragEnd = (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const { source, destination } = result;
    const localFromIndex = source.index;
    const localToIndex = destination.index;
    const pageSize = data?.pageSize || 10;
    const globalToIndex = (page - 1) * pageSize + localToIndex;
    const movedJobId = data.jobs[localFromIndex].id;
    reorderJobsMutation.mutate({ fromId: movedJobId, toIndex: globalToIndex, localFromIndex, localToIndex });
  };

  const handleFormSubmit = (formData) => {
    if (modalState.mode === 'edit') {
      updateJobMutation.mutate({ id: modalState.job.id, ...formData });
    } else {
      createJobMutation.mutate(formData);
    }
  };

  const isMutating = createJobMutation.isLoading || updateJobMutation.isLoading;
  const totalPages = data ? Math.ceil(data.totalCount / data.pageSize) : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Modal 
        title={modalState.mode === 'edit' ? 'Edit Job' : 'Create New Job'} 
        isOpen={modalState.mode !== 'closed'} 
        onClose={() => setModalState({ mode: 'closed' })}
      >
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-foreground/80">Job Title</label>
              <input id="title" type="text" {...register('title', { required: 'Job title is required' })}
                className="mt-1 block w-full bg-muted border border-secondary rounded-md shadow-sm py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent" />
              {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground/80">Description</label>
              <textarea id="description" {...register('description')} rows="4"
                className="mt-1 block w-full bg-muted border border-secondary rounded-md shadow-sm py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
              />
            </div>

            <Controller
              name="tags"
              control={control}
              render={({ field }) => <TagInput {...field} />}
            />

            {modalState.mode === 'edit' && (
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-foreground/80">Status</label>
                <select id="status" {...register('status')}
                  className="mt-1 block w-full bg-muted border border-secondary rounded-md shadow-sm py-2 px-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <Button type="button" variant="secondary" onClick={() => setModalState({ mode: 'closed' })}>Cancel</Button>
            <Button type="submit" disabled={isMutating}>
              {isMutating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Job Postings</h1>
        <Button onClick={() => setModalState({ mode: 'create' })}>
          <Plus className="w-5 h-5 mr-2 -ml-1" />
          Create New Job
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
        <div className="relative flex-grow w-full">
          <input type="text" placeholder="Search jobs by title..." value={search} onChange={(e) => updateSearchParam('search', e.target.value)}
            className="w-full bg-muted text-foreground rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 w-5 h-5" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select value={status} onChange={(e) => updateSearchParam('status', e.target.value === 'all' ? '' : e.target.value)}
            className="bg-muted text-foreground rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <MultiSelect options={allTags} selected={selectedTags} onChange={(tags) => updateSearchParam('tags', tags.join(','))} />
        </div>
      </div>

      {isLoading ? ( <Spinner /> ) : isError ? ( <div className="text-center p-8 text-red-500">Error: {queryError.message}</div> ) : (
        <>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="jobs">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data?.jobs.map((job, index) => (
                    <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <Link
                          to={{ pathname: `/jobs/${job.id}`, search: searchParams.toString() }}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-secondary rounded-lg p-5 flex flex-col justify-between group transition-shadow hover:ring-2 hover:ring-accent ${snapshot.isDragging ? 'shadow-2xl shadow-accent/50 ring-2 ring-accent' : 'shadow-md'}`}
                        >
                          <div>
                            <h2 className="text-xl font-semibold text-foreground truncate">{job.title}</h2>
                            <p className={`mt-2 text-sm font-medium inline-block px-2 py-1 rounded-full ${ job.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400' }`}>
                              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                            </p>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button variant="secondary" onClick={(e) => { e.preventDefault(); setModalState({ mode: 'edit', job }); }}>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                          </div>
                        </Link>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="flex justify-center items-center mt-8 gap-4">
            <Button onClick={() => updateSearchParam('page', String(Math.max(page - 1, 1)))} disabled={page === 1}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-foreground/80 font-medium">Page {page} of {totalPages || 1}</span>
            <Button onClick={() => updateSearchParam('page', String(Math.min(page + 1, totalPages)))} disabled={page >= totalPages}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}