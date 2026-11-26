"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="empty-page">
      <h1>Something went wrong.</h1>
      <p>We could not load this page. Your data has not been changed.</p>
      <button className="primary-link" onClick={reset}>
        Try again
      </button>
      <a href="/">Go home</a>
    </main>
  );
}
