/**
 * Who Pavan is, in words an agent can quote. Many people share the name Pavan
 * Patil, so the site states the same distinguishing facts everywhere: llms.txt,
 * the Markdown copies and the Person JSON-LD.
 */
import { getPortfolioContent } from "@/lib/portfolio";

/** Where Pavan is based. Matches the address in the Person JSON-LD. */
export const baseLocation = "Bengaluru, Karnataka, India";

/**
 * One sentence that tells this Pavan Patil apart from the others: role,
 * employer, city and the clients a recruiter would recognise.
 */
export function getDisambiguation() {
  const { profile, experience } = getPortfolioContent("en");
  const current = experience.find((item) => /present/i.test(item.period));
  const employer = current ? ` at ${current.company}` : "";

  return `${profile.name} is a ${profile.role.toLowerCase()}${employer}, based in ${baseLocation}, who builds web, mobile and backend products end to end. Past work includes projects for ${formatList(getClients())}.`;
}

/** Clients and past employers named in the experience, in order, without repeats. */
export function getClients() {
  const { experience } = getPortfolioContent("en");
  const names = experience.flatMap((item) => [
    ...(item.projects ?? []).map((project) => project.client),
    item.company,
  ]);
  const shortNames = names
    .map((name) => (name === "Defence Research and Development Organisation" ? "DRDO" : name))
    .filter((name) => !/ownpath/i.test(name));
  return [...new Set(shortNames)];
}

function formatList(items: string[]) {
  if (items.length < 2) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
