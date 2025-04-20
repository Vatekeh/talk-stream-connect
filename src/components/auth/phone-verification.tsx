
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export function PhoneVerification() {
  const { updatePhoneNumber, user } = useAuth();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updatePhoneNumber(phone);
    } catch (error) {
      console.error("Phone verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input 
          id="phone" 
          type="tel" 
          placeholder="+1234567890" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)}
          required
          disabled={loading}
          className="text-base md:text-sm"
        />
        <p className="text-sm text-muted-foreground">
          Please enter your phone number for verification
        </p>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          "Verify Phone Number"
        )}
      </Button>
    </form>
  );
}
