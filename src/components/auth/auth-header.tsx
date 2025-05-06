
import { Link } from "react-router-dom";

export function AuthHeader() {
  return (
    <header className="border-b border-clutch-slate bg-clutch-navy">
      <div className="container flex h-16 items-center">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-clutch-slate text-clutch-light font-semibold">
            C
          </div>
          <span className="font-semibold text-lg text-clutch-light">Clutch</span>
        </Link>
      </div>
    </header>
  );
}
