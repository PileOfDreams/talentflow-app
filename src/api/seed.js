// This is the seeding script, to auto-populate the local database with 25 jobs, 1000 candidates and 5 assessments of 15 questions each.

import { db } from './db';
import { faker } from '@faker-js/faker';

const JOB_COUNT = 25;
const CANDIDATE_COUNT = 1000;
const JOB_STATUSES = ['active', 'archived'];
const CANDIDATE_STAGES = ['applied', 'screen', 'tech', 'offer', 'hired', 'rejected'];
const JOB_TAGS = ['Full-time', 'Remote', 'Contract', 'Engineering', 'Design', 'Marketing', 'Product'];

const createSlug = (title) => {
  return title.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/--+/g, '-').replace(/^-+|-+$/g, '');
};

export async function seedDatabase() {
  console.log('Seeding database with corrected Job ID logic...');
  try {
    await Promise.all([
      db.jobs.clear(),
      db.candidates.clear(),
      db.assessments.clear(),
      db.assessmentResponses.clear(),
      db.timelineEvents.clear(),
    ]);

    // --- Create Jobs ---
    const jobs = [];
    const jobTitles = new Set();
    while (jobs.length < JOB_COUNT) {
      const title = faker.person.jobTitle();
      if (!jobTitles.has(title)) {
        jobTitles.add(title);
        jobs.push({
          title, slug: createSlug(title), status: faker.helpers.arrayElement(JOB_STATUSES),
          tags: faker.helpers.arrayElements(JOB_TAGS, faker.number.int({ min: 1, max: 3 })),
          order: jobs.length, description: faker.lorem.paragraphs(3), createdAt: faker.date.past(),
        });
      }
    }
    await db.jobs.bulkAdd(jobs);
    const addedJobs = await db.jobs.toArray();
    const jobIds = addedJobs.map(job => job.id);
    console.log(`${jobIds.length} jobs seeded.`);

    // --- Create Candidates ---
    const candidates = [];
    for (let i = 0; i < CANDIDATE_COUNT; i++) {
      const name = faker.person.fullName();
      candidates.push({
        name,
        email: faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] }),
        stage: faker.helpers.arrayElement(CANDIDATE_STAGES),
        jobId: faker.helpers.arrayElement(jobIds), // This will now receive a valid array of numbers
        avatar: faker.image.avatar(),
        createdAt: faker.date.past(),
      });
    }
    const candidateIds = await db.candidates.bulkAdd(candidates, { returning: true });
    console.log(`${candidateIds.length} candidates seeded.`);
    
    // --- Create Timeline Events for candidates ---
    const timelineEvents = [];
    for (let i = 0; i < 1000; i++) {
        // Safety check in case candidate creation failed
        if (!candidateIds[i]) continue;
        const candidateId = candidateIds[i];
        timelineEvents.push({
            candidateId, type: 'note', content: faker.lorem.sentence(),
            author: 'HR Team', timestamp: faker.date.past({ years: 1, refDate: new Date() }),
        });
        timelineEvents.push({
            candidateId, type: 'stage_change', content: `Moved to Screen`,
            author: 'System', timestamp: faker.date.past({ years: 1, refDate: new Date() }),
        });
    }
    await db.timelineEvents.bulkAdd(timelineEvents);
    console.log(`${timelineEvents.length} timeline events seeded.`);

// --- Create Assessments ---
    if (jobIds.length > 0) {
      // This is the question bank with 30 unique SAT-type aptitude questions.
      const questionPool = [
        { type: 'single-choice', category: 'verbal', text: 'Choose the word that is most nearly the opposite of BELITTLE.', options: ['Exaggerate', 'Diminish', 'Compliment', 'Attack'], answer: 'Exaggerate' },
        { type: 'single-choice', category: 'verbal', text: 'TREE is to FOREST as STAR is to...', options: ['Galaxy', 'Sky', 'Planet', 'Night'], answer: 'Galaxy' },
        { type: 'numeric', category: 'math', text: 'If 3x - 7 = 11, what is the value of x?', min: 0, max: 20 },
        { type: 'short-text', category: 'verbal', text: 'Complete the sentence: Despite the storm, the team was ___ to finish the project on time.' },
        { type: 'multi-choice', category: 'math', text: 'Which of the following numbers are prime? (Select all that apply)', options: ['17', '21', '29', '32', '41'] },
        { type: 'numeric', category: 'math', text: 'What is 15% of 300?', min: 0, max: 100 },
        { type: 'single-choice', category: 'verbal', text: 'Which word does not belong? DILIGENT, METICULOUS, CAREFUL, HASTY', options: ['Diligent', 'Meticulous', 'Hasty', 'Careful'], answer: 'Hasty' },
        { type: 'long-text', category: 'verbal', text: 'In a few sentences, explain the difference between "affect" and "effect".' },
        { type: 'numeric', category: 'math', text: 'A car travels 120 miles in 2 hours. What is its average speed in miles per hour?', min: 0, max: 100 },
        { type: 'single-choice', category: 'math', text: 'If a rectangle has a length of 8 and a width of 5, what is its perimeter?', options: ['13', '26', '40', '32'], answer: '26' },
        { type: 'short-text', category: 'verbal', text: 'Correct the grammatical error: "The team are working on a new feature."' },
        { type: 'multi-choice', category: 'verbal', text: 'Select the synonyms for "ephemeral".', options: ['Fleeting', 'Permanent', 'Transient', 'Lasting', 'Momentary'] },
        { type: 'numeric', category: 'math', text: 'Solve for y: 5(y + 2) = 30', min: -10, max: 10 },
        { type: 'single-choice', category: 'verbal', text: 'OCEAN is to WATER as GLACIER is to...', options: ['Mountain', 'Ice', 'Cold', 'Snow'], answer: 'Ice' },
        { type: 'long-text', category: 'verbal', text: 'Summarize a book you have recently read in two paragraphs.' },
        { type: 'numeric', category: 'math', text: 'What is the next number in the sequence: 2, 5, 11, 23, ...?', min: 30, max: 60 },
        { type: 'single-choice', category: 'math', text: 'If a pizza is divided into 8 slices, what angle does each slice make at the center?', options: ['30°', '45°', '60°', '90°'], answer: '45°' },
        { type: 'short-text', category: 'verbal', text: 'What is the main idea of the proverb "A stitch in time saves nine"?' },
        { type: 'multi-choice', category: 'math', text: 'Which of the following are perfect squares?', options: ['9', '12', '25', '30', '49'] },
        { type: 'numeric', category: 'math', text: 'The sum of two numbers is 25 and their difference is 5. What is the larger number?', min: 0, max: 30 },
        { type: 'single-choice', category: 'verbal', text: 'BOOK is to READING as FORK is to...', options: ['Eating', 'Spoon', 'Food', 'Kitchen'], answer: 'Eating' },
        { type: 'numeric', category: 'math', text: 'If a train travels at 80 km/h, how far will it travel in 90 minutes?', min: 100, max: 150 },
        { type: 'multi-choice', category: 'verbal', text: 'Select the antonyms for "benevolent".', options: ['Kind', 'Malevolent', 'Generous', 'Spiteful', 'Stingy'] },
        { type: 'single-choice', category: 'math', text: 'What is the area of a circle with a radius of 5? (Use π ≈ 3.14)', options: ['15.7', '31.4', '78.5', '25'], answer: '78.5' },
        { type: 'long-text', category: 'verbal', text: 'Argue for or against the statement: "Technology makes us more isolated."' },
        { type: 'numeric', category: 'math', text: 'If 20% of a number is 50, what is the number?', min: 200, max: 300 },
        { type: 'short-text', category: 'verbal', text: 'What is a palindrome? Give an example.' },
        { type: 'multi-choice', category: 'math', text: 'Which of the following fractions is the largest?', options: ['1/2', '3/4', '5/8', '2/3'] },
        { type: 'single-choice', category: 'verbal', text: 'The word "ubiquitous" most nearly means...', options: ['Rare', 'Omnipresent', 'Complex', 'Simple'], answer: 'Omnipresent' },
        { type: 'numeric', category: 'math', text: 'If a + b = 15 and a - b = 7, what is the value of a?', min: 0, max: 20 },
      ];
      
      const assessments = [];
      const numAssessments = 5;
      // Assessments are seeded for the first 5 active jobs
      // Get all jobs, then filter to find the first 5 ACTIVE job IDs
      const allJobs = await db.jobs.toArray();
      const activeJobIds = allJobs
        .filter(job => job.status === 'active')
        .map(job => job.id);

      if (activeJobIds.length < numAssessments) {
        console.warn(`Warning: Only found ${activeJobIds.length} active jobs. Seeding assessments for available active jobs.`);
      }
      
      const targetJobIds = activeJobIds.slice(0, numAssessments);

      for (let i = 0; i < targetJobIds.length; i++) {
        const jobId = targetJobIds[i];
        // Shuffle the pool to get a unique set of questions for each assessment
        const shuffledPool = [...questionPool].sort(() => 0.5 - Math.random());
        const selectedQuestions = shuffledPool.slice(0, 15);
        let requiredCount = 0;
        const questionsWithIds = selectedQuestions.map((q, index) => {
          const newQuestion = { ...q, id: `q_${i}_${index}` };
          // For the first 3 assessments, make 3-4 questions required
          if (i < 3 && requiredCount < 4 && Math.random() > 0.6) {
            newQuestion.required = true;
            requiredCount++;
          }
          return newQuestion;
        });
        
        const verbalQuestions = questionsWithIds.filter(q => q.category === 'verbal');
        const mathQuestions = questionsWithIds.filter(q => q.category === 'math');

        const assessment = {
          jobId: jobId, // Assign to a specific active job
          structure: {
            title: `General Aptitude Assessment ${i + 1}`,
            sections: [
              { id: `sec_${i}_1`, title: 'Verbal Ability', questions: verbalQuestions },
              { id: `sec_${i}_2`, title: 'Quantitative Aptitude', questions: mathQuestions },
            ],
          },
        };
        assessments.push(assessment);
      }

      await db.assessments.bulkAdd(assessments);
      console.log(`${assessments.length} detailed assessments seeded for active jobs.`);
    }
    
    console.log('Database seeding complete!');
    localStorage.setItem('db_seeded_v4', 'true');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Function to check if the DB needs seeding and run it.
export async function ensureSeedData() {
    const isSeeded = localStorage.getItem('db_seeded_v4') === 'true';
    if (!isSeeded) {
        await seedDatabase();
    } else {
        console.log('Database already seeded.');
    }
}