
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mb-8">
            Last updated: May 9, 2025
          </div>
          
          <div className="prose prose-slate max-w-none">
            <h2 className="text-xl font-semibold mb-4">Introduction</h2>
            <p className="mb-6">
              Welcome to Clutsh. We value your privacy and are committed to protecting your personal data. 
              This Privacy Policy explains how we handle your personal information when you use our Chrome 
              extension, web application, and associated services.
            </p>
            <p className="mb-6">
              By using Clutsh, you agree to this Privacy Policy.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-lg font-medium mb-2">1. Account Information</h3>
            <p className="mb-4">When you sign up or log in, we collect:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Your email address</li>
              <li className="mb-2">Your authentication tokens</li>
              <li className="mb-2">Basic account profile information (username, avatar)</li>
            </ul>
            
            <h3 className="text-lg font-medium mb-2">2. Extension & Usage Data</h3>
            <p className="mb-4">Our Chrome extension automatically collects and securely sends the following data:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">URLs of pages visited (only if content is flagged as NSFW)</li>
              <li className="mb-2">Types of media detected (image, video, text)</li>
              <li className="mb-2">Categories of flagged content</li>
              <li className="mb-2">Duration of viewing or interaction times</li>
              <li className="mb-2">Timestamps of detections</li>
            </ul>
            
            <h3 className="text-lg font-medium mb-2">3. Technical Data</h3>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Browser type and version</li>
              <li className="mb-2">IP address (used solely for security and authentication purposes)</li>
              <li className="mb-2">Device type and operating system</li>
            </ul>
            
            <h2 className="text-xl font-semibold mb-4">How We Use Your Information</h2>
            <p className="mb-4">We use collected data to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Provide and operate the core functionalities of Clutsh</li>
              <li className="mb-2">Generate personal analytics and insights</li>
              <li className="mb-2">Secure and protect your account</li>
              <li className="mb-2">Improve our services and extension performance</li>
              <li className="mb-2">Respond to your support requests</li>
            </ul>
            
            <h2 className="text-xl font-semibold mb-4">Data Storage & Security</h2>
            <p className="mb-6">
              Your data is stored securely using Supabase, a platform with robust security standards. 
              We employ encryption for sensitive data at rest and in transit. Access is strictly limited 
              to authorized staff for operational purposes only.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">Sharing Your Data</h2>
            <p className="mb-6">
              We do not sell or share your data with third parties for marketing purposes. However, 
              your data may be shared with trusted third-party services solely to provide critical 
              services such as authentication, analytics, or hosting, all of which comply with strict 
              privacy standards.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">Cookies and Local Storage</h2>
            <p className="mb-6">
              We use local storage mechanisms in your browser to store authentication tokens and preferences 
              to enhance your experience. You can clear these anytime by managing your browser settings.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">User Control & Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">View and access your personal data via your Clutsh profile.</li>
              <li className="mb-2">Correct inaccuracies in your personal data.</li>
              <li className="mb-2">Delete your account and associated data at any time via your profile settings.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mb-4">Changes to this Privacy Policy</h2>
            <p className="mb-6">
              We may occasionally update this policy to reflect changes in our practices. When we do, 
              we'll update the "last updated" date at the top. Continued use of Clutsh after changes 
              implies acceptance.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">Contact Us</h2>
            <p className="mb-4">For questions or concerns about your privacy, contact us at:</p>
            <p className="mb-6">Email: privacy@clutsh.app</p>
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
