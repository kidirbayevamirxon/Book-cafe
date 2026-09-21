import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-forest/15 py-8 px-5 text-center text-sm text-ink/55">
      <div>"Book–Cafe" loyihasi — Investorlar uchun taqdimot asosida ishlab chiqilgan platforma</div>
      <div className="mt-3 text-xs">
        <span className="text-ink/40">Xodim sifatida RFID darvozani boshqarish uchun: </span>
        <Link to="/rfid" className="text-forest font-semibold hover:underline">RFID kiosk</Link>
      </div>
    </footer>
  );
}
