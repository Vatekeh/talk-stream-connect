
import { Link } from "react-router-dom";

export function AuthHeader() {
  return (
    <header className="border-b border-clutsh-slate bg-clutsh-navy">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clutsh-slate text-clutsh-light font-semibold">
            C
          </div>
          <span className="font-semibold text-lg text-clutsh-light">Clutsh</span>
        </Link>
      </div>
    </header>
  );
}
