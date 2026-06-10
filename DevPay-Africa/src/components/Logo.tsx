import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/devpay-logo.png";

export function Logo({ className = "", showText = true }: { className?: string; showText?: boolean }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img src={logoImg} alt="DevPay Africa" className="h-9 w-9 object-contain" />
      {showText && (
        <span className="font-display font-bold text-lg tracking-tight">
          DevPay <span className="text-primary">Africa</span>
        </span>
      )}
    </Link>
  );
}
