
/**
 * ExtensionAuthPage
 * 
 * This page provides authentication for the browser extension.
 * It renders a login form that uses email/password authentication
 * and redirects to the callback URL with the appropriate session.
 */
import { ExtensionAuthLayout } from "@/components/extension-auth/ExtensionAuthLayout";
import { ExtensionAuthForm } from "@/components/extension-auth/ExtensionAuthForm";

export default function ExtensionAuthPage() {
  return (
    <ExtensionAuthLayout>
      <ExtensionAuthForm />
    </ExtensionAuthLayout>
  );
}
