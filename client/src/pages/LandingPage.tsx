import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  ArrowRight, 
  Layers, 
  Lightbulb, 
  Users, 
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Realistic mock data for the workspace preview panel
  const mockEvents = [
    {
      title: "Smart Campus Hackathon 2026",
      organizer: "Department of CSE",
      date: "June 15, 2026",
      teamsCount: 14,
      prize: "₹50,000"
    },
    {
      title: "Sustainable Tech Buildathon",
      organizer: "Green Energy Club",
      date: "July 02, 2026",
      teamsCount: 8,
      prize: "₹30,000"
    }
  ];

  const mockIdeas = [
    {
      title: "Hostel Maintenance & Grievance Tracker",
      domain: "Web",
      skills: ["React", "Node.js", "Express"],
      upvotes: 18
    },
    {
      title: "Smart Attendance System via Geofenced QR",
      domain: "Mobile",
      skills: ["Flutter", "Firebase", "Geolocation"],
      upvotes: 24
    }
  ];

  return (
    <div className="bg-primary-light min-h-screen text-brown font-sans">
      {/* Top minimalistic header bar (only shown if not logged in) */}
      <header className="border-b border-beige bg-cream sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-primary" />
            <span className="font-bold tracking-tight text-sm text-brown">
              Hack<span className="text-primary">Match</span>
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-secondary-light text-slate-600 rounded">
              v1.0.0
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded transition-colors"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-brown transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main split grid workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Product guide & CTAs (5 columns) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary-light border border-beige">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-650">
                Academic Collaboration Workspace
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brown leading-tight">
              Assemble teams. <br />
              Pitch hackathon ideas. <br />
              Build local solutions.
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              HackMatch is a collaborative portal modeled after developer tools. It helps computer science students and engineers coordinate project ideas, list technical requirements, and assemble functional teams for upcoming campus hackathons.
            </p>

            {/* Structured workflow checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5">
                <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-brown">Campus Discovery Directory</h3>
                  <p className="text-[11px] text-slate-500">List skill proficiencies (React, Python, Flutter) to matched teammates locally.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-brown">Devpost-style Event Logs</h3>
                  <p className="text-[11px] text-slate-500">Browse active events with rules, registration cutoffs, and group limits.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle size={14} className="text-primary mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-xs font-bold text-brown">Structured Idea Marketplace</h3>
                  <p className="text-[11px] text-slate-500">Pitch project briefs, review target skills, and vote on student-proposed concepts.</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded flex items-center gap-1.5 transition-colors border border-transparent shadow-sm"
                >
                  Enter Workspace Dashboard <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="px-5 py-2.5 text-xs font-bold text-white bg-primary hover:bg-primary-hover rounded flex items-center gap-1.5 transition-colors border border-transparent shadow-sm"
                  >
                    Create Workspace Account <ArrowRight size={14} />
                  </Link>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-xs font-bold text-brown bg-cream hover:bg-secondary-light border border-beige rounded transition-colors"
                  >
                    Access Member Portal
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right panel: Mock Workspace UI Interface (7 columns) */}
          <div className="lg:col-span-7 bg-cream border border-beige rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden">
            
            {/* Header bar mimicking an active app dashboard */}
            <div className="bg-secondary-light border-b border-beige px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-cream px-2 py-0.5 border border-beige rounded">
                  localhost:3000/workspace
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold">LIVE ACTIVITY FEED</span>
            </div>

            {/* Body of the mock dashboard */}
            <div className="p-5 space-y-5 text-left">
              
              {/* Upcoming events preview */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Upcoming Hackathons
                  </span>
                  <span className="text-[9px] text-slate-500 hover:underline font-semibold cursor-pointer">Browse 8 events</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {mockEvents.map((event, idx) => (
                    <div key={idx} className="border border-beige rounded p-3 bg-secondary-light hover:border-primary transition-all">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-brown line-clamp-1">{event.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-450 mt-1">{event.organizer}</p>
                      <div className="mt-2.5 flex justify-between items-center text-[9px] font-semibold border-t border-beige pt-2">
                        <span className="text-slate-500">{event.date}</span>
                        <span className="text-slate-700 bg-beige/50 px-1.5 py-0.5 rounded">{event.prize}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Project brainstorms preview */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <Lightbulb size={12} /> Live Project Briefs
                  </span>
                  <span className="text-[9px] text-slate-500 hover:underline font-semibold cursor-pointer">View 16 briefs</span>
                </div>
                
                <div className="space-y-2">
                  {mockIdeas.map((idea, idx) => (
                    <div key={idx} className="border border-beige rounded p-2.5 bg-cream flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 text-[8px] font-bold uppercase rounded bg-secondary-light text-slate-650">
                            {idea.domain}
                          </span>
                          <h4 className="text-xs font-bold text-brown line-clamp-1">{idea.title}</h4>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {idea.skills.map(s => (
                            <span key={s} className="text-[9px] text-slate-500 bg-secondary-light px-1 rounded">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-600 bg-secondary-light border border-beige px-2 py-1 rounded">
                          ▲ {idea.upvotes}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample teammates checklist indicator */}
              <div className="border-t border-beige pt-4 grid grid-cols-2 gap-4 text-[11px] text-slate-400 font-semibold">
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-slate-450" />
                  <span><strong>140+</strong> active classmates online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-slate-450" />
                  <span><strong>48</strong> complete teams matched</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Info documentation block */}
      <section className="bg-cream border-t border-beige py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-left max-w-3xl">
            <h2 className="text-base font-bold text-brown uppercase tracking-wider mb-2">Workspace Guidelines</h2>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              HackMatch provides a structured utility to solve the common issues in student project selection. Instead of scrambling for team members the night before registrations close, establish compatibility, review project domain interests, and register teams with pre-validated roles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-[11px] text-slate-500">
              <div>
                <h4 className="font-bold text-brown mb-1">1. Set Up Your Skill Card</h4>
                <p className="leading-relaxed">Add programming stack, tools, frameworks, and past academic projects. Availability is public by default.</p>
              </div>
              <div>
                <h4 className="font-bold text-brown mb-1">2. Align on Pitch Domains</h4>
                <p className="leading-relaxed">Browse suggested project ideas and upvote concepts. Review required skill cards to fill gaps.</p>
              </div>
              <div>
                <h4 className="font-bold text-brown mb-1">3. Team Workspace Integration</h4>
                <p className="leading-relaxed">Invite matches to team profiles. Once accepted, use the internal workspace chat to coordinate submission files.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-beige bg-primary-light text-slate-400 text-[11px] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-brown font-bold">HackMatch Workspace</span>
            <span className="ml-2 text-slate-400">| Academic team utility</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-650">Documentation</a>
            <a href="#" className="hover:text-slate-650">API Status</a>
            <a href="#" className="hover:text-slate-650">Support Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
