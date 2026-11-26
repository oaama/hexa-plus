"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, LockKeyhole, LoaderCircle } from "lucide-react";
import { login } from "./actions";
export default function Login() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <main className="login-page">
      <section className="login-story">
        <Link href="/" className="wordmark">
          HEXA<span>PLUS</span>
          <sup>+</sup>
        </Link>
        <div>
          <span className="eyebrow">THE HEXA PLUS WORKSPACE</span>
          <h1>
            Good ideas.
            <br />
            Connected people.
            <br />
            <span>Work that moves.</span>
          </h1>
          <p>The private workspace for the team behind the work.</p>
        </div>
        <span className="login-foot">
          DIGITAL SOLUTIONS + MARKETING · MINYA, EGYPT
        </span>
      </section>
      <section className="login-panel">
        <Link href="/" className="back-home">
          Back to website <ArrowUpRight size={16} />
        </Link>
        <div className="login-form-wrap">
          <img
            src="/hexa-logo.png"
            width="150"
            height="126"
            alt="HEXA PLUS"
          />
          <span className="eyebrow">
            <LockKeyhole size={14} /> PRIVATE WORKSPACE
          </span>
          <h2>Welcome back.</h2>
          <p>Sign in with your team account to continue.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const result = await login(new FormData(e.currentTarget));
              if (result?.error) setError(result.error);
              setBusy(false);
            }}
          >
            <label className="form-field">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                required
                autoComplete="username"
                placeholder="you@company.com"
              />
            </label>
            <label className="form-field">
              <span>Password</span>
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Your password"
              />
            </label>
            {error && (
              <p role="alert" className="field-error">
                {error}
              </p>
            )}
            <button className="primary-link" disabled={busy}>
              {busy ? (
                <LoaderCircle size={18} className="spin" />
              ) : (
                <>
                  Sign in <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </form>
          <p className="form-note">
            Access is managed by your workspace administrator.
            <br />
            No public registration.
          </p>
        </div>
      </section>
    </main>
  );
}
