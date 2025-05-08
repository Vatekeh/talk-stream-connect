
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExtensionLoginForm } from "./ExtensionLoginForm";
import { ExtensionSignupForm } from "./ExtensionSignupForm";

export function ExtensionAuthForm() {
  return (
    <Card className="w-full max-w-md border-clutsh-slate bg-clutsh-steel/50 shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl text-clutsh-light">Clutsh Extension Login</CardTitle>
        <CardDescription className="text-clutsh-muted">
          Sign in to connect the Clutsh browser extension
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-clutsh-navy">
            <TabsTrigger value="login" className="data-[state=active]:bg-clutsh-slate data-[state=active]:text-clutsh-light">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-clutsh-slate data-[state=active]:text-clutsh-light">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <ExtensionLoginForm />
          </TabsContent>
          
          <TabsContent value="signup">
            <ExtensionSignupForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
