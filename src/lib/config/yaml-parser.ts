import yaml from "js-yaml";
import { ProfileSchema, ConfigSchema, type Profile, type Config } from "./schema";

export function parseProfile(yamlStr: string): Profile {
  const raw = yaml.load(yamlStr);
  return ProfileSchema.parse(raw);
}

export function parseConfig(yamlStr: string): Config {
  const raw = yaml.load(yamlStr);
  return ConfigSchema.parse(raw);
}

export function dumpProfile(profile: Profile): string {
  return yaml.dump(profile, { lineWidth: 120, quotingType: '"' });
}

export function dumpConfig(config: Config): string {
  return yaml.dump(config, { lineWidth: 120, quotingType: '"' });
}

export const DEFAULT_PROFILE_YAML = `personal:
  name: ""
  email: ""
  phone: ""
  location: ""
  linkedin: ""
  github: ""
  portfolio: ""

summary: ""

experience:
  - title: ""
    company: ""
    duration: ""
    responsibilities:
      - ""
    skills: []

education:
  - degree: ""
    institution: ""
    year: ""

skills:
  primary: []
  backend: []
  tools: []

projects: []
`;

export const DEFAULT_CONFIG_YAML = `search:
  keywords:
    - "Frontend Engineer"
    - "React Developer"
    - "Full Stack Engineer"
  locations:
    - "Remote"
  platforms:
    - linkedin
  experience_level:
    - mid-level
    - senior
  job_type:
    - full-time
    - remote
  blacklist_companies: []
  blacklist_keywords: []

application:
  min_fit_score: 7
  max_applications_per_run: 20
  auto_apply: false
  cover_letter: true
  tailor_resume: true

ai:
  model: "gpt-4o"
  resume_aggressiveness: "moderate"
`;
