
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Rocket, 
  Wrench, 
  Bug, 
  Calendar, 
  ChevronRight, 
  Pin, 
  Mail
} from "lucide-react";

export default function ChangelogPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Changelog & Release Notes</h1>
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
          
          <div className="prose prose-slate max-w-none">
            <div className="border-b border-border pb-4 mb-8">
              <p className="text-lg">
                This page documents comprehensive updates, features, improvements, and bug fixes across Clutsh's development lifecycle.
              </p>
            </div>
            
            {/* Current Update */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="text-talkstream-purple h-5 w-5" />
                <h2 className="text-2xl font-semibold" id="v1-4-0">
                  [1.4.0] - 2025-05-09 <span className="text-sm bg-talkstream-purple/10 text-talkstream-purple px-2 py-1 rounded-md">Current Update</span>
                </h2>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="text-talkstream-purple h-4 w-4" />
                  <h3 className="text-xl font-medium">New Features</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <h4 className="font-medium mb-1">Complete NSFWJS Integration</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Chrome extension now detects and reports NSFW content directly to Supabase backend.</li>
                    <li className="mb-1">Real-time blurring of inappropriate images/videos.</li>
                    <li className="mb-1">Persistent user activity logging to replace static data.</li>
                  </ul>
                  
                  <h4 className="font-medium mb-1">Comprehensive Onboarding Flow</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Step-by-step onboarding wizard for first-time users.</li>
                    <li className="mb-1">Chrome extension setup assistance integrated directly within the app.</li>
                    <li className="mb-1">Automatic verification and testing step for extension installation.</li>
                  </ul>
                  
                  <h4 className="font-medium mb-1">Global Renaming Initiative</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li>Application name fully updated from <strong>"Clutch"</strong> → <strong>"Clutsh"</strong> across codebase, database, and documentation.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="text-blue-500 h-4 w-4" />
                  <h3 className="text-xl font-medium">Improvements & Refactoring</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <h4 className="font-medium mb-1">Extensive Refactoring and Cleanup</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Entire codebase audited and annotated; inline comments added every 2–3 lines.</li>
                    <li className="mb-1">Removed vestigial architecture and legacy code to streamline performance.</li>
                  </ul>
                  
                  <h4 className="font-medium mb-1">Supabase Backend Enhancements</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Implemented robust row-level security policies.</li>
                    <li className="mb-1">Updated Supabase Edge functions for event collection and storage.</li>
                  </ul>
                  
                  <h4 className="font-medium mb-1">Improved Error Handling</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Addressed frequent "Extension context invalidated" runtime errors.</li>
                    <li>Comprehensive exception handling for content scripts and storage operations.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="text-red-500 h-4 w-4" />
                  <h3 className="text-xl font-medium">Bug Fixes</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <ul className="list-disc pl-6">
                    <li className="mb-1">Resolved issues with JWT token storage and authentication logic.</li>
                    <li className="mb-1">Fixed data persistence and retrieval inconsistencies in user profile pages.</li>
                    <li>Corrected Chrome extension's event handling edge cases causing intermittent errors.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Previous Updates */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="text-gray-500 h-5 w-5" />
                <h2 className="text-2xl font-semibold" id="v1-3-0">[1.3.0] - 2025-04-25</h2>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="text-talkstream-purple h-4 w-4" />
                  <h3 className="text-xl font-medium">New Features</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <h4 className="font-medium mb-1">User Activity Analytics</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Patterns dashboard providing hourly/daily insights into user browsing habits.</li>
                    <li className="mb-1">Real-time synchronization of user events from Chrome extension.</li>
                  </ul>
                  
                  <h4 className="font-medium mb-1">Advanced User Interactions Tracking</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Added tracking for video seek-back, dwell times, blur/focus events to improve detection accuracy.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="text-blue-500 h-4 w-4" />
                  <h3 className="text-xl font-medium">Improvements</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <ul className="list-disc pl-6">
                    <li className="mb-1">Upgraded the Chrome extension's user interface and interaction patterns.</li>
                    <li>Improved heuristics for detecting user behaviors indicative of risky or unsafe browsing.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="text-gray-500 h-5 w-5" />
                <h2 className="text-2xl font-semibold" id="v1-2-0">[1.2.0] - 2025-04-09</h2>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="text-talkstream-purple h-4 w-4" />
                  <h3 className="text-xl font-medium">New Features</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <h4 className="font-medium mb-1">Voice-Based Journaling (Therapy MVP Integration)</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Integrated basic voice journaling feature prototype (CBT-focused insights).</li>
                    <li className="mb-1">Provided initial backend support for transcript and insight management.</li>
                  </ul>
                  
                  <h4 className="font-medium mb-1">Cursor Agent Integration</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Utilized Cursor agent for automated debugging and task handling.</li>
                    <li className="mb-1">Enabled automation of repetitive tasks, such as copying and moving leads within the system.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="text-red-500 h-4 w-4" />
                  <h3 className="text-xl font-medium">Bug Fixes</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <ul className="list-disc pl-6">
                    <li>Addressed issues with voice journal transcription accuracy and backend synchronization.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="text-gray-500 h-5 w-5" />
                <h2 className="text-2xl font-semibold" id="v1-1-0">[1.1.0] - 2025-03-31</h2>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="text-talkstream-purple h-4 w-4" />
                  <h3 className="text-xl font-medium">New Features</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <h4 className="font-medium mb-1">Initial AI-Assisted Debugging System</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Implemented AI model for error logging and automated debugging.</li>
                    <li className="mb-1">Integrated model directly into the developer workflow.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="text-blue-500 h-4 w-4" />
                  <h3 className="text-xl font-medium">Improvements</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <ul className="list-disc pl-6">
                    <li>Significantly improved the reliability of lead and campaign management functionalities.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="text-red-500 h-4 w-4" />
                  <h3 className="text-xl font-medium">Bug Fixes</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <ul className="list-disc pl-6">
                    <li>Fixed numerous small UI/UX glitches within the campaign funneling system.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="text-gray-500 h-5 w-5" />
                <h2 className="text-2xl font-semibold" id="v1-0-0">
                  [1.0.0] - 2025-03-01 <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-md">Initial Release 🎉</span>
                </h2>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Rocket className="text-talkstream-purple h-4 w-4" />
                  <h3 className="text-xl font-medium">Core Features</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <h4 className="font-medium mb-1">Chrome Extension</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Initial detection of NSFW content.</li>
                    <li className="mb-1">Basic blur functionality and notification system.</li>
                  </ul>
                  
                  <h4 className="font-medium mb-1">Dashboard & User Management</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Simple user dashboard for account settings.</li>
                    <li className="mb-1">Static activity log and placeholder analytics.</li>
                  </ul>
                  
                  <h4 className="font-medium mb-1">Backend Infrastructure</h4>
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Initial Supabase configuration for user authentication.</li>
                    <li>Basic security setup and authentication logic.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Upcoming */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="text-blue-500 h-5 w-5" />
                <h2 className="text-2xl font-semibold">Upcoming (Roadmap)</h2>
              </div>
              
              <div className="pl-6 border-l border-border ml-2">
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded border border-muted-foreground flex items-center justify-center mr-2">
                    </div>
                    <span>Mobile and responsive dashboard design for enhanced usability.</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded border border-muted-foreground flex items-center justify-center mr-2">
                    </div>
                    <span>Expanded privacy controls (data export and deletion).</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded border border-muted-foreground flex items-center justify-center mr-2">
                    </div>
                    <span>Additional browser compatibility (Firefox, Edge).</span>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded border border-muted-foreground flex items-center justify-center mr-2">
                    </div>
                    <span>Advanced AI-driven analytics and personalized behavioral insights.</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Website & Documentation Updates */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Pin className="text-gray-500 h-5 w-5" />
                <h2 className="text-2xl font-semibold">Website & Documentation Updates (May 2025)</h2>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-medium">Legal & Compliance</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Added comprehensive Privacy Policy.</li>
                    <li className="mb-1">Released detailed Terms of Service.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-medium">User Support</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Created a clear and thorough onboarding experience for Chrome extension installation.</li>
                    <li className="mb-1">Published FAQ & Help Center documentation for user troubleshooting and setup.</li>
                  </ul>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-medium">Security</h3>
                </div>
                <div className="pl-6 border-l border-border ml-2">
                  <ul className="list-disc pl-6 mb-3">
                    <li className="mb-1">Implemented detailed Security and Data Protection statements.</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* User Feedback Section */}
            <div className="mb-8 bg-muted p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-5 w-5" />
                <h2 className="text-xl font-semibold">User Feedback & Requests</h2>
              </div>
              <p className="mb-2">Your feedback helps us grow! Send your suggestions or report issues to:</p>
              <a href="mailto:feedback@clutsh.app" className="text-talkstream-purple hover:underline">
                feedback@clutsh.app
              </a>
            </div>
            
            {/* Template Example */}
            <div className="mb-8 border p-4 rounded-lg bg-slate-50">
              <h3 className="text-lg font-medium mb-2">Template for Future Updates:</h3>
              <pre className="bg-slate-100 p-3 rounded text-sm overflow-auto">
{`## 📌 [Version] - YYYY-MM-DD

### 🚀 New Features
- Description of newly implemented features.

### 🛠 Improvements
- List enhancements and optimizations to current features.

### 🐞 Bug Fixes
- Specific bugs or issues resolved in this release.`}
              </pre>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-muted py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} Clutsh. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
