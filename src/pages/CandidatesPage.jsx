import React, { useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { fetchCandidates, updateCandidateStage } from '../lib/api';
import { Search, List, KanbanSquare } from 'lucide-react';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';
import KanbanBoard from '../components/KanbanBoard.jsx';
import { Link, useSearchParams } from 'react-router-dom';

const STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];

// These semantic colors remain unchanged as they convey specific meaning
const stageColors = {
  applied: 'bg-blue-500/20 text-blue-400',
  screen: 'bg-sky-500/20 text-sky-400',
  tech: 'bg-teal-500/20 text-teal-400',
  offer: 'bg-purple-500/20 text-purple-400',
  hired: 'bg-green-500/20 text-green-400',
  rejected: 'bg-red-500/20 text-red-400',
};

export default function CandidatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') || 'list';
  const search = searchParams.get('search') || '';
  const stageFilter = searchParams.get('stage') || 'all';
  const queryClient = useQueryClient();

  const updateSearchParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const filters = { 
    stage: view === 'list' ? stageFilter : 'all' 
  };
  
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ['candidates', filters],
    queryFn: fetchCandidates,
  });

  const updateStageMutation = useMutation({
    mutationFn: updateCandidateStage,
    onMutate: ({ candidateId, newStage }) => {
      const queryKey = ['candidates', { stage: 'all' }];
      queryClient.cancelQueries({ queryKey });
      const previousCandidates = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old) => {
        if (!old) return [];
        return old.map(c => c.id === candidateId ? { ...c, stage: newStage } : c);
      });
      return { previousCandidates, queryKey };
    },
    onError: (err, variables, context) => {
      toast.error(`Failed to move candidate: ${err.message}`);
      if (context.previousCandidates) {
        queryClient.setQueryData(context.queryKey, context.previousCandidates);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
    },
  });

  const clientSideFilteredCandidates = useMemo(() => {
    if (!search) return candidates;
    return candidates.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [candidates, search]);

  const candidatesByStage = useMemo(() => {
    const allCandidates = queryClient.getQueryData(['candidates', { stage: 'all' }]) || [];
    const searchedCandidates = !search ? allCandidates : allCandidates.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email.toLowerCase().includes(search.toLowerCase())
    );
    const grouped = STAGES.reduce((acc, stage) => ({ ...acc, [stage]: [] }), {});
    searchedCandidates.forEach(candidate => {
      if (grouped[candidate.stage]) {
        grouped[candidate.stage].push(candidate);
      }
    });
    return grouped;
  }, [candidates, search, queryClient]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;
    const candidateId = parseInt(draggableId, 10);
    const newStage = destination.droppableId;
    updateStageMutation.mutate({ id: candidateId, stage: newStage });
  };

  const parentRef = useRef();
  const rowVirtualizer = useVirtualizer({
    count: clientSideFilteredCandidates.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 10,
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates</h1>
        <div className="flex items-center gap-2">
          <div className="p-1 bg-muted rounded-md flex">
            <div className="relative group">
              <button onClick={() => updateSearchParam('view', 'list')} className={`px-3 py-1 text-sm rounded transition-colors ${view === 'list' ? 'bg-primary text-accent-foreground' : 'text-foreground/70 hover:bg-secondary'}`} aria-label="List View">
                <List className="w-5 h-5" />
              </button>
              <span className="absolute bottom-full mb-2 w-max bg-secondary text-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -translate-x-1/2 left-1/2">List View</span>
            </div>
            <div className="relative group">
              <button onClick={() => updateSearchParam('view', 'board')} className={`px-3 py-1 text-sm rounded transition-colors ${view === 'board' ? 'bg-primary text-accent-foreground' : 'text-foreground/70 hover:bg-secondary'}`} aria-label="Board View">
                <KanbanSquare className="w-5 h-5" />
              </button>
              <span className="absolute bottom-full mb-2 w-max bg-secondary text-foreground text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none -translate-x-1/2 left-1/2">Board View</span>
            </div>
          </div>
          <div className="relative">
            <input type="text" placeholder="Search by name/email..." value={search} onChange={(e) => updateSearchParam('search', e.target.value)}
              className="w-full bg-muted text-foreground rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 w-5 h-5" />
          </div>
          {view === 'list' && (
            <select value={stageFilter} onChange={(e) => updateSearchParam('stage', e.target.value === 'all' ? '' : e.target.value)}
              className="bg-muted text-foreground rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent">
              <option value="all">All Stages</option>
              {STAGES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          )}
        </div>
      </div>

      {isLoading && candidates.length === 0 ? <Spinner /> : (
        view === 'board' 
          ? <KanbanBoard candidatesByStage={candidatesByStage} onDragEnd={handleDragEnd} searchParamsString={searchParams.toString()} /> 
          : (
            <div ref={parentRef} className="flex-grow overflow-auto rounded-lg bg-secondary border border-muted">
              <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map(virtualItem => {
                  const candidate = clientSideFilteredCandidates[virtualItem.index];
                  if (!candidate) return null;
                  return (
                    <Link to={{ pathname: `/candidates/${candidate.id}`, search: searchParams.toString() }} key={virtualItem.key}>
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                        className="flex items-center p-4 border-b border-muted hover:bg-muted/50"
                      >
                        <img src={`https://i.pravatar.cc/40?u=${candidate.email}`} alt={candidate.name} className="w-10 h-10 rounded-full mr-4" />
                        <div className="flex-grow">
                          <p className="font-semibold text-foreground">{candidate.name}</p>
                          <p className="text-sm text-foreground/70">{candidate.email}</p>
                        </div>
                        <span className={`text-sm capitalize font-medium px-3 py-1 rounded-full ${stageColors[candidate.stage] || 'bg-muted text-foreground/80'}`}>
                          {candidate.stage}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )
      )}
    </div>
  );
}