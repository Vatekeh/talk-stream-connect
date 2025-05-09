
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      
      <div className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Terms of Service</h1>
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground mb-8">
            Last updated: May 9, 2025
          </div>
          
          <div className="prose prose-slate max-w-none">
            <p className="mb-6">
              Welcome to Clutsh. These Terms of Service ("Terms") govern your use of our Chrome extension, 
              web application, and associated services (collectively, the "Service"). By accessing or using 
              our Service, you agree to these Terms.
            </p>
            <p className="mb-6">
              Please read these Terms carefully.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-6">
              By using Clutsh, you signify your agreement to these Terms. If you do not agree, you may not use the Service.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">2. Eligibility</h2>
            <p className="mb-6">
              You must be at least 18 years old or have attained the age of majority in your jurisdiction to use Clutsh.
              By using the Service, you represent and warrant that you meet this eligibility requirement.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">3. Your Account and Responsibilities</h2>
            <p className="mb-4">Account Security: You are responsible for maintaining the security of your account credentials and authentication tokens.</p>
            <p className="mb-4">Account Activity: You accept responsibility for all activities and usage occurring under your account.</p>
            <p className="mb-6">Notify us immediately at security@clutsh.app if you suspect unauthorized access or activity.</p>
            
            <h2 className="text-xl font-semibold mb-4">4. Use of the Service</h2>
            <h3 className="text-lg font-medium mb-2">Permitted Use</h3>
            <p className="mb-4">You may use Clutsh for your personal, non-commercial purposes consistent with these Terms.</p>
            
            <h3 className="text-lg font-medium mb-2">Prohibited Conduct</h3>
            <p className="mb-4">You must not use Clutsh to:</p>
            <ul className="list-disc pl-6 mb-6">
              <li className="mb-2">Violate laws or regulations applicable in your jurisdiction.</li>
              <li className="mb-2">Engage in fraudulent, abusive, or malicious behavior.</li>
              <li className="mb-2">Attempt to disrupt, hack, or interfere with our Service or compromise user security.</li>
              <li className="mb-2">Copy, resell, or distribute our Service without our express written permission.</li>
            </ul>
            <p className="mb-6">Violation may result in immediate suspension or termination of your account.</p>
            
            <h2 className="text-xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="mb-6">
              Clutsh and its original content, features, branding, trademarks, and functionality are the exclusive 
              property of Clutsh and its licensors. You agree not to copy, modify, distribute, or create derivative 
              works without prior written permission from us.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">6. Privacy</h2>
            <p className="mb-6">
              Our Privacy Policy clearly outlines how we handle and protect your data. Please review it to understand 
              your privacy rights and our data practices.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">7. Disclaimers & Liability</h2>
            <h3 className="text-lg font-medium mb-2">No Warranty</h3>
            <p className="mb-4">
              Clutsh is provided on an "as is" and "as available" basis. We expressly disclaim all warranties, 
              whether express or implied, regarding accuracy, reliability, availability, or suitability for your needs.
            </p>
            
            <h3 className="text-lg font-medium mb-2">Limitation of Liability</h3>
            <p className="mb-6">
              Under no circumstances will Clutsh, its affiliates, partners, or licensors be liable for indirect, 
              incidental, consequential, special, or punitive damages arising from your use of, or inability to use, the Service.
              Our total liability in connection with your use of the Service shall not exceed the amount paid by you, 
              if any, for accessing Clutsh in the last 12 months.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">8. Indemnification</h2>
            <p className="mb-6">
              You agree to indemnify, defend, and hold harmless Clutsh and its affiliates, directors, officers, 
              employees, and agents from any claims, damages, losses, liabilities, and costs arising from or related to:
              your breach of these Terms, your violation of applicable laws, or your misuse of the Service.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">9. Changes to the Service and Terms</h2>
            <p className="mb-4">
              We reserve the right to update, modify, or discontinue features or functionalities of the Service at any time.
            </p>
            <p className="mb-6">
              We may update these Terms periodically. When we do, we'll notify you by updating the date at the top. 
              Your continued use signifies acceptance.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">10. Termination of Service</h2>
            <p className="mb-4">
              We may terminate or suspend your access to the Service immediately, without prior notice or liability, 
              for any reason, including if you breach these Terms.
            </p>
            <p className="mb-4">You may terminate your account at any time through your account settings.</p>
            <p className="mb-6">Upon termination, your right to use the Service immediately ceases.</p>
            
            <h2 className="text-xl font-semibold mb-4">11. Governing Law</h2>
            <p className="mb-6">
              These Terms will be governed by the laws of the jurisdiction in which Clutsh operates, 
              without regard to conflicts of law provisions.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">12. Severability</h2>
            <p className="mb-6">
              If any portion of these Terms is found invalid or unenforceable, that provision will be limited or 
              eliminated to the minimum extent necessary, and the remaining provisions will remain fully enforceable.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">13. Entire Agreement</h2>
            <p className="mb-6">
              These Terms constitute the entire agreement between you and Clutsh regarding your use of the Service 
              and supersede all prior agreements.
            </p>
            
            <h2 className="text-xl font-semibold mb-4">14. Contact Information</h2>
            <p className="mb-4">If you have any questions regarding these Terms, contact us at:</p>
            <p className="mb-4">Email: legal@clutsh.app</p>
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
