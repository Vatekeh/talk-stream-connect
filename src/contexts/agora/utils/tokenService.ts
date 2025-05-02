
import { supabase } from "@/integrations/supabase/client";

/**
 * Get an Agora token from the edge function
 */
export const getAgoraToken = async (channelName: string, uid: number): Promise<string> => {
  try {
    console.log(`[Agora] Getting token for channel ${channelName}, uid ${uid}`);
    const { data, error } = await supabase.functions.invoke("get-agora-token", {
      body: { channel: channelName, uid: uid.toString(), role: "publisher" },
    });

    if (error) throw error;
    console.log("[Agora] Token received");
    return data.token;
  } catch (error) {
    console.error("[Agora] Error getting token:", error);
    throw error;
  }
};

/**
 * Get Agora App ID from edge function
 */
export const getAgoraAppId = async (): Promise<string> => {
  const { data, error } = await supabase.functions.invoke("get-agora-appid", {
    body: {}
  });
  
  if (error || !data?.appId) {
    throw new Error("Failed to retrieve Agora App ID");
  }
  
  return data.appId;
};
