import Link from "next/link";
export default function NotFound() {
  return (
    <main className="empty-page">
      <span className="eyebrow">404 / PAGE NOT FOUND</span>
      <h1>Nothing at this address.</h1>
      <p>The page may have moved.</p>
      <Link className="primary-link" href="/">
        Back to HEXA PLUS
      </Link>
    </main>
  );
}
