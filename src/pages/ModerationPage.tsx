import { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/types";
import { mockRooms } from "@/lib/mock-data";
import { Ban, Check, ExternalLink, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { DetectionLogs } from "@/components/detection/DetectionLogs";

export default function ModerationPage() {
  // Mock alerts - this would be fetched from Supabase
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: "1",
      roomId: "1",
      userId: "5",
      type: "nsfw",
      content: "Inappropriate language detected",
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      isResolved: false,
    },
    {
      id: "2",
      roomId: "3",
      userId: "6",
      type: "harassment",
      content: "Potential harassment detected",
      timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      isResolved: false,
    },
    {
      id: "3",
      roomId: "2",
      userId: "4",
      type: "spam",
      content: "Repetitive messaging detected",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      isResolved: true,
    }
  ]);
  
  const activeAlerts = alerts.filter(alert => !alert.isResolved);
  const resolvedAlerts = alerts.filter(alert => alert.isResolved);
  
  const handleResolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, isResolved: true } : alert
    ));
  };
  
  const formatAlertTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getRoomById = (roomId: string) => {
    return mockRooms.find(room => room.id === roomId);
  };
  
  const getAlertTypeLabel = (type: string) => {
    switch(type) {
      case "nsfw": return { label: "NSFW Content", color: "destructive" };
      case "harassment": return { label: "Harassment", color: "destructive" };
      case "spam": return { label: "Spam", color: "default" };
      default: return { label: "Other", color: "default" };
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader isAuthenticated={true} userName="Alex Johnson" isModerator={true} />
      
      <main className="flex-1 container py-6">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
            <p className="text-muted-foreground">Monitor and respond to alerts from rooms</p>
          </div>
          
          <Tabs defaultValue="active" className="w-full">
            <TabsList>
              <TabsTrigger value="active" className="relative">
                Active
                {activeAlerts.length > 0 && (
                  <Badge className="ml-2 bg-talkstream-purple text-white">{activeAlerts.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="detection-logs">Detection Logs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active" className="mt-4">
              {activeAlerts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeAlerts.map(alert => {
                    const room = getRoomById(alert.roomId);
                    const typeInfo = getAlertTypeLabel(alert.type);
                    
                    return (
                      <Card key={alert.id} className="animate-in">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <Badge variant={typeInfo.color as any}>{typeInfo.label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatAlertTime(alert.timestamp)}
                            </span>
                          </div>
                          <CardTitle className="text-lg mt-2">{room?.name || "Unknown Room"}</CardTitle>
                          <CardDescription>{alert.content}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-4">
                              <Button 
                                variant="outline" 
                                size="sm"
                                asChild
                              >
                                <Link to={`/room/${alert.roomId}`} className="flex gap-1">
                                  <Eye size={15} />
                                  View Room
                                </Link>
                              </Button>
                              
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="flex gap-1"
                              >
                                <Ban size={15} />
                                Ban User
                              </Button>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleResolveAlert(alert.id)}
                            >
                              <Check size={18} className="mr-1" />
                              Resolve
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h2 className="text-xl font-medium">No active alerts</h2>
                  <p className="text-muted-foreground">
                    There are currently no active alerts to moderate
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="resolved" className="mt-4">
              {resolvedAlerts.length > 0 ? (
                <div className="space-y-4">
                  {resolvedAlerts.map(alert => {
                    const room = getRoomById(alert.roomId);
                    const typeInfo = getAlertTypeLabel(alert.type);
                    
                    return (
                      <Card key={alert.id} className="animate-in">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <Badge variant="outline">{typeInfo.label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatAlertTime(alert.timestamp)}
                            </span>
                          </div>
                          <CardTitle className="text-lg mt-2">{room?.name || "Unknown Room"}</CardTitle>
                          <CardDescription>{alert.content}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              asChild
                            >
                              <Link to={`/room/${alert.roomId}`} className="flex gap-1">
                                <ExternalLink size={15} />
                                View Room
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <h2 className="text-xl font-medium">No resolved alerts</h2>
                  <p className="text-muted-foreground">
                    There are no resolved alerts in the history
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="detection-logs" className="mt-4">
              <DetectionLogs />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
