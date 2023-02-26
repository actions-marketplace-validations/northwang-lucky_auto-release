import { getInput } from "@actions/core";
import { context, getOctokit } from "@actions/github";
import { Options } from "./types";
import { getResponseData } from "./utils";

const options = (function parseOptions(): Options {
  return {
    filepath: getInput("filepath", { required: true }),
    githubToken: getInput("github-token", { required: true }),
    branch: getInput("branch") || "main",
  };
})();

const octokit = (function login() {
  return getOctokit(options.githubToken);
})();

export async function createRelease() {
  const [tag, changelog] = await extractLatestTagAndChangelog();
  const isPrerelease = ["alpha", "bate", "rc"].some((sign) =>
    tag.includes(sign)
  );
  const { id, tag_name, html_url } = await getResponseData(() =>
    octokit.rest.repos.createRelease({
      ...context.repo,
      tag_name: tag,
      name: tag,
      body: changelog,
      prerelease: isPrerelease,
    })
  );
  return { id, tag_name, url: html_url };
}

async function getLatestTwoTags(): Promise<string[]> {
  const data = await getResponseData(() =>
    octokit.rest.repos.listTags(context.repo)
  );
  return data.map((info) => info.name).slice(0, 2);
}

async function getChangelogContent(): Promise<string> {
  const data = await getResponseData(() =>
    octokit.rest.repos.getContent({
      ...context.repo,
      path: options.filepath,
      ref: options.branch,
    })
  );
  return Buffer.from((data as { content: string }).content, "base64").toString(
    "utf-8"
  );
}

async function extractLatestTagAndChangelog(): Promise<[string, string]> {
  const tags = await getLatestTwoTags();
  const changelogContent = await getChangelogContent();

  const [latestVersion, perviousVersion] = tags.map((tag) =>
    tag.replace(/^v/, "")
  );
  const startMatcher = changelogContent.match(
    RegExp(`\n[#]{2,3} \\[?${latestVersion.split(".").join("\\.")}\\]?`)
  );
  const endMatcher = changelogContent.match(
    RegExp(`\n[#]{2,3} \\[?${perviousVersion.split(".").join("\\.")}\\]?`)
  );

  if (!startMatcher) {
    console.error(changelogContent, startMatcher, endMatcher);
    throw new Error("Extract changelog failed!");
  }
  return [
    tags[0],
    changelogContent.slice(startMatcher.index, endMatcher?.index),
  ];
}
