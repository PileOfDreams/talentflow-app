// BONUS feature: A landing page, with mission statement, testimonials, logos and animations

/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fetchSampleCandidates } from '../lib/api';
import Spinner from '../components/Spinner';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TalentFlowLogo from '../components/TalentFlowLogo';

const AnimatedSection = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8 }}
    className="py-16 px-4"
  >
    {children}
  </motion.div>
);

// NOTE: The HeadHunters logo SVG below uses hardcoded colors by design.
// This is a stylistic choice to maintain a consistent brand identity across themes.
// Also scalable, as we can just modify the SVG to create new logos
const HeadHuntersLogo = () => (
    <svg width="48" height="48" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g style={{ mixBlendMode: 'screen' }}>
            <path 
                d="M20 20 V80 M45 20 V80 M20 50 H45" 
                stroke="#FBBF24" 
                strokeWidth="14" 
                strokeLinecap="round"
            />
            <path 
                d="M55 20 V80 M80 20 V80 M55 50 H80" 
                stroke="#EF4444" 
                strokeWidth="14" 
                strokeLinecap="round"
            />
        </g>
    </svg>
);

const testimonialVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

export default function HomePage() {
  const { data: testimonials = [], isLoading: isLoadingTestimonials } = useQuery({
    queryKey: ['sampleCandidates'],
    queryFn: fetchSampleCandidates,
  });

  const [[currentTestimonial, direction], setTestimonialState] = useState([0, 0]);

  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setTestimonialState(([prev]) => [(prev + 1) % testimonials.length, 1]);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [testimonials.length, currentTestimonial]);

  const paginate = (newDirection) => {
    setTestimonialState(([prev]) => [(prev + newDirection + testimonials.length) % testimonials.length, newDirection]);
  };
  
  const missionStatement = "TalentFlow is more than just a hiring platform; it's a paradigm shift in recruitment. Our mission is to empower HR teams by replacing fragmented workflows with a single, elegant source of truth. We believe that by providing intuitive tools- from a dynamic jobs board to insightful candidate timelines and tailored assessments- we can free up your most valuable resource: time. Time, to focus on what truly matters- finding and nurturing the right talent. We've meticulously designed every feature, from drag-and-drop interfaces to highly customizable assessment builders, to create an experience that is not only powerful but also a genuine pleasure to use. With TalentFlow, you're not just filling roles; you're building the future of your company, one perfect hire at a time, with clarity and confidence.";
  const aboutUs = "HeadHunters Inc. was born from a decade of frontline experience in the competitive world of talent acquisition. We've lived the challenges: the endless spreadsheets, the communication gaps, the struggle to maintain a consistent evaluation standard. We knew there had to be a better way. That's why we created TalentFlow. It's the platform we always wished we had- a tool built by recruiters, for recruiters. Our philosophy is simple: technology should serve people, not the other way round. Every feature in TalentFlow is a direct answer to a real-world problem, refined through countless hours of practical application. We are committed to continuous innovation, driven by the feedback of our community, to ensure that TalentFlow remains the most intuitive and effective hiring platform on the market.";
  const ceoForeword = "\"For years, I saw the immense passion of HR professionals buried under administrative tasks. We were talent scouts armed with spreadsheets, chasing down feedback in endless email chains. The human element of human resources was getting lost in all the noise. I founded HeadHunters Inc. to change that, and TalentFlow is the culmination of that vision. It's a platform built on a simple premise: technology should empower human connection, not replace it. Every feature is designed to put you in control, so you can focus on what's really meaningful- having insightful conversations, making strategic decisions, and building teams that last. We've helped thousands of recruiters and candidates alike, find a place where they belong. We're not just creating software; we're restoring the 'human' to Human Resources.\"";
  const testimonialTexts = [
    "The entire process was incredibly smooth. I loved the clear timeline and always knew where I stood.",
    "Taking the assessment on TalentFlow was a great experience. It felt professional and relevant to the job.",
    "Finally, a hiring platform that respects the candidate's time. The interface is clean and easy to use.",
    "From application to offer, TalentFlow made everything straightforward. A huge improvement over other systems.",
    "The clarity and communication through the platform were top-notch. It really sets a new standard.",
    "I've applied to dozens of jobs, and this was by far the most organized and intuitive platform I've encountered.",
    "The assessment felt challenging but fair, and I appreciated seeing my progress in the timeline.",
    "A truly modern and refreshing approach to recruitment. The user experience is clearly a top priority.",
    "It's rare to feel this connected and informed during a job application process. Highly recommended.",
    "The team behind TalentFlow clearly understands the candidate's perspective. It made a huge difference."
  ];

  return (
    <div className="overflow-y-auto h-full">
      <div className="relative h-[60vh] flex items-center justify-center text-center p-4">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop')"}}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text mb-4">
            Welcome to TalentFlow
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto mb-8">
            The all-in-one platform to streamline your hiring process.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/jobs" className="bg-secondary hover:bg-primary text-foreground font-bold py-3 px-6 rounded-lg transition-all hover:scale-105">Jobs</Link>
            <Link to="/candidates" className="bg-secondary hover:bg-primary text-foreground font-bold py-3 px-6 rounded-lg transition-all hover:scale-105">Candidates</Link>
            <Link to="/assessments" className="bg-secondary hover:bg-primary text-foreground font-bold py-3 px-6 rounded-lg transition-all hover:scale-105">Assessments</Link>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto max-w-5xl">
        <AnimatedSection>
          <div className="flex items-center gap-6">
            <TalentFlowLogo />
            <h2 className="text-3xl font-bold text-foreground">Our Mission</h2>
          </div>
          <p className="mt-4 text-foreground/70 leading-relaxed">{missionStatement}</p>
        </AnimatedSection>
        
        <AnimatedSection>
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">A Foreword from Our CEO</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex-shrink-0 text-center">
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop" 
                alt="Eleanora Vance" 
                className="w-40 h-40 rounded-full object-cover mx-auto border-4 border-muted shadow-lg"
              />
              <h3 className="text-xl font-bold text-foreground mt-4">Eleanora Vance</h3>
              <p className="text-sm text-foreground/50">Founder & CEO, HeadHunters Inc.</p>
            </div>
            <div className="max-w-xl">
              <p className="text-lg italic text-foreground/70 leading-relaxed selection:bg-primary/50">
                {ceoForeword}
              </p>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection>
          <div className="flex items-center gap-6">
            <HeadHuntersLogo />
            <h2 className="text-3xl font-bold text-foreground">About HeadHunters Inc.</h2>
          </div>
          <p className="mt-4 text-foreground/70 leading-relaxed">{aboutUs}</p>
        </AnimatedSection>
        
        <AnimatedSection>
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">What Our Candidates Say</h2>
          <div className="relative h-48 flex items-center justify-center px-12">
            
            <button 
              onClick={() => paginate(-1)} 
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-secondary/50 hover:bg-muted/80 rounded-full p-2 z-20 transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-foreground" />
            </button>

            {isLoadingTestimonials ? <Spinner /> : (
              <AnimatePresence custom={direction} mode="wait">
                {testimonials.length > 0 && testimonials[currentTestimonial] && (
                  <motion.div
                    key={currentTestimonial}
                    custom={direction}
                    variants={testimonialVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute w-full max-w-2xl text-center"
                  >
                    <img src={testimonials[currentTestimonial].avatar} alt={testimonials[currentTestimonial].name} className="w-16 h-16 rounded-full mx-auto mb-4 border-2 border-accent"/>
                    <p className="text-lg italic text-foreground/80">"{testimonialTexts[currentTestimonial % testimonialTexts.length]}"</p>
                    <h3 className="font-bold text-foreground mt-4">- {testimonials[currentTestimonial].name}</h3>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            <button 
              onClick={() => paginate(1)} 
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-secondary/50 hover:bg-muted/80 rounded-full p-2 z-20 transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-foreground" />
            </button>

          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}