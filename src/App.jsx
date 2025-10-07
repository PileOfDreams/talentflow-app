// The logical structure of our app
// May be thought of as the "orchestrator"

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import AssessmentsPage from './pages/AssessmentsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> }, // HomePage is the default for "/"
      { path: 'jobs', element: <JobsPage /> }, // JobsPage now lives at "/jobs"
      { path: 'jobs/:jobId', element: <JobDetailPage /> },
      { path: 'candidates', element: <CandidatesPage /> },
      { path: 'candidates/:candidateId', element: <CandidateProfilePage /> },
      { path: 'assessments', element: <AssessmentsPage /> },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}
export default App;