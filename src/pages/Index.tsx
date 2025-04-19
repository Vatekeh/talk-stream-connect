
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { HandHelping } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-2">
            <HandHelping className="w-8 h-8 text-talkstream-purple" />
            <span className="text-xl font-bold text-white">Clutch</span>
          </div>
          <nav>
            <Link to="/login">
              <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex flex-col items-center justify-center max-w-6xl mx-auto mt-20">
          {/* Hero Section */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                When You Need a
                <span className="text-talkstream-purple"> Helping Hand</span>
              </h1>
              <p className="text-gray-300 text-lg mb-8 max-w-xl">
                Connect with professionals who are ready to support you through your journey. 
                Experience personalized guidance and unwavering support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button className="bg-talkstream-purple hover:bg-talkstream-purple/90 text-white px-8">
                  Get Started
                </Button>
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="flex-1 relative">
              <div className="relative w-full max-w-md mx-auto">
                <div className="aspect-[3/4] relative">
                  <img 
                    src="/lovable-uploads/f6617d82-9257-4618-bd1e-c81e35bc55fa.png"
                    alt="Helping Hands Illustration"
                    className="w-full h-full object-cover rounded-lg shadow-2xl"
                  />
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-gray-900/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
