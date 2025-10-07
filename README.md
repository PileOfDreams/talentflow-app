TalentFlow - A Mini Hiring Platform
TalentFlow is a feature-rich, front-end application designed to simulate a modern hiring platform for HR teams. It provides a suite of tools to manage job postings, track candidates through the hiring pipeline, and build custom skill assessments. The entire application runs locally, using a mock API and browser-based storage to provide a complete, interactive experience without an actual backend.
User Features
The application is organized into three primary sections, each designed to streamline a core part of the recruitment workflow.
Jobs Page
This page serves as the central hub for managing all job postings. I implemented a comprehensive set of features that allow a user to:
•	View a paginated list of all jobs, which can be filtered by status (Active/Archived) and by multiple job tags using a custom multi-select dropdown.
•	Search for jobs by title, with the results updating in real-time.
•	Persistently maintain all filter and search states in the URL, allowing for bookmarking and sharing of filtered views.
•	Create new jobs and edit existing ones (including title, description, status, and tags) through a robust modal form.
•	Reorder jobs via a smooth drag-and-drop interface, with changes reflected instantly through optimistic updates.
•	Click on any job to navigate to a "deep-linkable" detail page that displays its full description and tags.
Candidates Page
This section is designed for efficient management of the entire candidate pool. Key functionalities I built include:
•	A choice between two viewing modes: a traditional list view and a Kanban board view.
•	A virtualized list that can smoothly render and scroll through a database of over 1,000 candidates without performance degradation.
•	Client-side search to instantly find candidates by name or email.
•	The ability to move candidates between different hiring stages (Applied, Screen, Tech, etc.) via drag-and-drop on the Kanban board, with changes saved optimistically.
•	Deep-linkable candidate profile pages that display a full activity timeline, consisting of stage changes, notes, and completed assessments.
•	A note-taking feature on the profile page with support for @mentions, which are highlighted and suggest teammates from a local list.
Assessments Page
This is a tool for creating and simulating job-specific quizzes. I implemented a two-pane interface where an HR manager can:
•	Build custom assessments for any active job, consisting of multiple sections and questions.
•	Choose from a wide variety of question types, including single-choice, multi-choice, short/long text, file uploads, and numeric questions with a configurable range.
•	Define validation rules for each question, such as "required," "max length," and numeric ranges.
•	Implement conditional logic, allowing questions to be shown or hidden based on a candidate's answer to a previous question.
•	See a live, interactive preview of the assessment that updates in real-time as the form is built.
•	Simulate the candidate experience by filling out and submitting the form, which then appears on a randomly assigned candidate's timeline.
Note: By default, the local database is seeded with 25 jobs, 1000 candidates and 5 assessments of 15 questions each (assigned to first 5 active jobs).

Technical
Setup and Installation
To get this project running on your local machine, please follow these steps.
Prerequisites:
•	Node.js (v18 or later is recommended)
•	npm (which comes with Node.js)
Manual Setup Steps:
1.	Open your terminal and clone this repository to your local machine:
git clone [https://github.com/YOUR_USERNAME/talentflow-app.git](https://github.com/YOUR_USERNAME/talentflow-app.git)
2.	Navigate to the Project Directory: 
cd talentflow-app
3.	Run the following command to install all the necessary packages for the project: 
npm install
4.	Once the installation is complete, start the Vite development server: npm run dev
5.	The terminal will display a local URL (usually http://localhost:5173). Open this URL in your web browser to see the application running. The first time you run the app, the database will be automatically seeded with sample data, which may take a few moments.

Developer Tools
I chose a modern toolset to build this application, focusing on developer experience, performance, and maintainability. It comprises:
•	Vite & React: The core of the application is built with React, powered by Vite for a fast development environment and optimized production builds.
•	Tailwind CSS: I used Tailwind for all styling. This utility-first framework allowed for quick development of a custom and responsive user interface without writing custom CSS.
•	React Router: For all client-side routing, including dynamic routes for deep links and the useSearchParams hook for remembering user’s search filters.
•	TanStack Query (React Query): I used this library as the single source of truth for all "server" state. It handles all data fetching, caching, and state management, making complex features like optimistic updates and automatic re-fetching clean and easy.
•	Mock Service Worker (MSW): To simulate a complete backend API, I used MSW to intercept network requests and provide realistic responses, including artificial latency and random error rates.
•	Dexie.js (IndexedDB): All data is persisted locally in the browser's IndexedDB. Dexie is an easy-to-use wrapper for managing the database tables and queries.
•	Framer Motion: I used this library for all major animations, including the fade-in-on-scroll effects and the sliding testimonial carousel on the homepage.
•	@hello-pangea/dnd: A modern, maintained fork of react-beautiful-dnd, used for all drag-and-drop functionality on the Jobs page and the Candidates Kanban board.
•	React Hook Form: For all complex forms, including the "Create Job" modal and the Assessment Preview, to handle state, validation, and submission efficiently.
•	Immer: Used within the Assessment Builder to allow for safe and easy "mutation" of the deeply nested assessment structure state.
•	React Hot Toast: For providing clean, non-intrusive feedback to the user for events like API errors or successful form submissions.
•	Lucide React: For all icons throughout the application, providing a clean and consistent visual language.

Basic Workflow
I have designed the application's technical flows based on my current knowledge of modern best practices.
•	API Simulation & Persistence: MSW intercepts all fetch requests. For GET requests, it queries the Dexie database. For mutations (POST, PATCH), it first validates the incoming data, then writes the changes to the Dexie database before returning a success or error response. This simulates a real network layer while keeping all data local.
•	Data Fetching & Caching: All data is fetched via useQuery from React Query. This provides several benefits, including automatic caching (so navigating back to a page is instant), refetching on window focus, and declarative management of loading and error states.
•	Optimistic Updates: For high-interaction features like drag-and-drop or adding a note, I used useMutation with an onMutate function. This allows the UI to be updated instantly, providing a smooth user experience. The API call happens in the background. If it fails (simulated), the onError callback uses a snapshot of the old state to roll the UI back to its original position, and a toast message informs the user.
•	Persistent Filters: To ensure a user never loses their context, all filter states on the Jobs and Candidates pages are stored in the URL using the useSearchParams hook. This is the single source of truth, making the filtered views shareable and persistent across navigation.
•	Large List Performance: To handle the list of 1000+ candidates without crashing the browser, I used @tanstack/react-virtual. It cleverly renders only the handful of DOM nodes that are currently visible in the scrollable area, recycling them as the user scrolls.

Project Structure
The “src” folder contains all the major project files and corresponds to the logical structure of the project. It consists of the following sub-directories:
•	api: Contains the core local database logic. The db.js file defines the tables and indexes, while seed.js is responsible for populating the database with realistic initial data.
•	components: This is the heart of the UI, containing all the reusable building blocks that help us to create the pages.
•	context: Holds the React Context providers that manage global application state- namely, the theme switcher, for customizing UI.
•	lib: A dedicated place for the API client. All fetch calls are defined here, providing a clean separation between the UI and the data-fetching layer.
•	mocks: Contains all the logic for our mock API server, powered by MSW. The handlers.js file defines the API routes and their behavior.
•	pages: Contains the main components for each route in the application (e.g., JobsPage.jsx, CandidatesPage.jsx). These components are responsible for fetching page-specific data and arranging the layout of smaller components.

Technical Challenges
Throughout this project, I encountered several challenging bugs that required debugging and refining the code architecture:
1.	Persistent Profile Page Bug: The most significant challenge was a bug where the candidate profile page would crash with an “Invalid key provided” error. After exhaustively verifying every file in the React application, I discovered through manual database inspection that the jobId for every candidate was undefined. I traced this to a subtle failure in the seed.js script, where db.jobs.bulkAdd(..., { returning: true }) was not returning the new IDs as expected. I solved this by refactoring the script to use a more robust two-step process: first add the jobs, then explicitly query the database to get their generated IDs before creating the candidates.
2.	Drag-and-Drop with Pagination: The drag-and-drop for reordering jobs initially failed because the component provided a local index (e.g., item 2 on page 3), while the database needed a global index (e.g., item 22). I solved this by calculating the globalToIndex in the handleOnDragEnd function before calling the mutation, ensuring the API received the correct data to update the database.
3.	Theme Swapping Bug: The theme switcher was consistently applying the wrong colors for two specific themes. I initially suspected a state management issue, but after proving the React logic was correct via a diagnostic test, I identified the root cause as a CSS specificity conflict in index.css. My initial use of the :root selector was overriding the theme classes. I fixed this by refactoring the CSS to use fully isolated, independent class names for each theme, which removed the conflicts.
4.	Filter State Persistence: Initially, all applied filters (e.g. “Active” jobs with “Remote” tag) were stored in local component state (useState), which meant they were lost whenever the user navigated away from the page by clicking a deep link. I refactored this entire system to store the filter state in the URL's query parameters using the useSearchParams hook, creating a more robust and user-friendly experience.

Bonus Features
In addition to the core requirements, I have added a few bonus features that elevate the UI/UX and professional polish of the application.
•	Homepage & Branding: I designed a complete, animated landing page that serves as the application's entry point. It includes custom-designed SVG logos, a hero section with a background image and gradient overlay, and multiple content sections with text and images that fade in on scroll to create an engaging user experience.
•	Customizable UI (Theme Switcher): I implemented a full-featured theme switcher with four distinct themes (“Classic Dark”, “Vintage Brown”, “Fairytale Pink” and “Discord Blue”). This was built using React Context for global state management and CSS variables for a scalable theme architecture. The user's preferred theme choice also persists in localStorage.
•	Interactive Feedback (Toasts): I used react-hot-toast to provide users with non-intrusive feedback for actions like saving data or encountering a simulated server error. For the assessment submission, I created a custom toast that includes a direct link to the relevant candidate's timeline, closing the feedback loop.
•	Job Details: I implemented deep-linkable job detail pages that show the full description and tags, providing more context and value than just a title on a card.

