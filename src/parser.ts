import { ParsedPrompt } from "./types.js";

export function parsePrompt(prompt: string): ParsedPrompt {
  // Try multiple patterns to extract a project key from the prompt.
  const projectPatterns = [
    /Project(?: Key)?:\s*([A-Za-z0-9_-]+)/i,
    /Project Key\s*[-:]\s*([A-Za-z0-9_-]+)/i,
    /^([A-Z0-9_-]{2,8})(?:\s|[-:])/m,
  ];

  let projectKey: string | undefined;
  for (const p of projectPatterns) {
    const m = prompt.match(p);
    if (m?.[1]) {
      projectKey = m[1].trim();
      break;
    }
  }

  // Fallback to environment variable if set
  if (!projectKey && process.env.ZEPHYR_PROJECT_KEY) {
    projectKey = process.env.ZEPHYR_PROJECT_KEY;
  }

  if (!projectKey) {
    throw new Error(
      "Project key not found in prompt. Include a line like 'Project: ABC' or set ZEPHYR_PROJECT_KEY env var."
    );
  }

  const testCasesSection = prompt.split(/Test Cases:/i)[1];

  if (!testCasesSection) {
    throw new Error("Test cases section missing");
  }

  const testCases = testCasesSection
    .split("\n")
    .map(line => line.trim())
    .filter(line =>
      line.startsWith("-") ||
      line.match(/^\d+\./) ||
      line.length > 3
    )
    .map(line => line.replace(/^[-\d.]\s*/, ""));

  return {
    projectKey,
    testCases
  };
}
