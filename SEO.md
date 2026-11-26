# SEO and Search Console (HEXA PLUS)

Sitemap: `<site>/sitemap.xml` (EN and AR URLs with hreflang alternates). Robots: `<site>/robots.txt`.

Config (env vars, set as Worker secrets on Cloudflare or env vars on Render):
- `NEXT_PUBLIC_SITE_URL`: production origin, no trailing slash. Used for canonicals, sitemap, OG.
- `GOOGLE_SITE_VERIFICATION`: the token from Search Console's HTML tag method. Renders the google-site-verification meta tag. Unset means no tag.
- `BING_SITE_VERIFICATION`: optional, same idea for Bing Webmaster Tools.

Verify and submit:
1. Search Console, Add property, URL prefix, enter the production URL (for example https://hexa-plus.angluosr.workers.dev).
2. Choose HTML tag, copy the content value only, set it as GOOGLE_SITE_VERIFICATION, redeploy, click Verify.
3. Sitemaps, enter `sitemap.xml`, Submit.
4. URL Inspection, paste `/` and `/ar`, Request indexing.
Indexing and ranking are confirmed only in Search Console.
