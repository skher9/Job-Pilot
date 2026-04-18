import type { Config } from "@/lib/config/schema";

export interface Job {
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  platform: "linkedin" | "indeed" | "naukri";
}

export async function scrapeLinkedIn(
  config: Config,
  log: (msg: string) => void
): Promise<Job[]> {
  const { chromium } = await import("playwright");
  const jobs: Job[] = [];
  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context.newPage();

    for (const keyword of config.search.keywords.slice(0, 3)) {
      for (const location of config.search.locations.slice(0, 2)) {
        log(`Scraping LinkedIn: "${keyword}" in "${location}"`);
        const encoded = encodeURIComponent(keyword);
        const encodedLoc = encodeURIComponent(location);
        const url = `https://www.linkedin.com/jobs/search/?keywords=${encoded}&location=${encodedLoc}&f_AL=true&f_TPR=r86400`;

        try {
          await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
          await page.waitForTimeout(2000);

          const cards = await page.$$(".job-search-card, .base-card");
          log(`Found ${cards.length} job cards`);

          for (const card of cards.slice(0, 5)) {
            try {
              const title =
                (await card.$eval(".base-search-card__title, h3", (el) => el.textContent?.trim())) ?? "";
              const company =
                (await card.$eval(".base-search-card__subtitle, h4", (el) => el.textContent?.trim())) ?? "";
              const loc =
                (await card.$eval(".job-search-card__location", (el) => el.textContent?.trim())) ?? "";
              const href =
                (await card.$eval("a", (el) => el.getAttribute("href"))) ?? "";

              if (!title || !company) continue;

              const blacklisted = config.search.blacklist_companies?.some((c) =>
                company.toLowerCase().includes(c.toLowerCase())
              );
              if (blacklisted) continue;

              const keywordBlacklisted = config.search.blacklist_keywords?.some((k) =>
                title.toLowerCase().includes(k.toLowerCase())
              );
              if (keywordBlacklisted) continue;

              jobs.push({
                title,
                company,
                location: loc,
                description: "",
                url: href.startsWith("http") ? href : `https://linkedin.com${href}`,
                platform: "linkedin",
              });
            } catch {
              // skip malformed cards
            }
          }
        } catch (err) {
          log(`Error scraping LinkedIn for "${keyword}": ${err}`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  return jobs;
}

export async function fetchJobDescription(url: string): Promise<string> {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);

    const description = await page
      .$eval(
        ".description__text, .jobs-description__content, #job-details",
        (el) => el.textContent?.trim()
      )
      .catch(() => "");

    return description ?? "";
  } finally {
    await browser.close();
  }
}
