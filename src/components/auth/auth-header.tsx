
import { Link } from "react-router-dom";

export function AuthHeader() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-talkstream-purple text-white font-semibold">
            TS
          </div>
          <span className="font-semibold text-lg">TalkStream</span>
        </Link>
      </div>
    </header>
  );
}
