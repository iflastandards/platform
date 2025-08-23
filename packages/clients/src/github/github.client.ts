import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';
import { ClientApiError, ClientError } from '../errors';
// GraphQL types not generated yet
// import {
//   type ListDiscussionsQuery,
//   type ListDiscussionsQueryVariables,
//   ListDiscussionsDocument,
// } from './gql/graphql';

// Define some basic parameter types for clarity
interface RepoInfo {
  owner: string;
  repo: string;
  [key: string]: any; // Allow additional properties for Octokit
}

interface CreateIssueParams extends RepoInfo {
  title: string;
  body?: string;
  labels?: string[];
}

interface CreatePullRequestParams extends RepoInfo {
  title: string;
  head: string;
  base: string;
  body?: string;
  draft?: boolean;
}

interface CreateIssueParams extends RepoInfo {
  title: string;
  body?: string;
  labels?: string[];
}

interface CreatePullRequestParams extends RepoInfo {
  title: string;
  head: string; // The branch to pull from
  base: string; // The branch to pull into
  body?: string;
}

/**
 * GitHub Client - A wrapper around Octokit for common repository operations.
 * This client provides methods for interacting with Issues, Pull Requests,
 * and other GitHub features in a structured way.
 */
export class GitHubClient {
  private octokit: Octokit;
  private graphql: typeof graphql;

  constructor(authToken: string) {
    if (!authToken) {
      throw new ClientError('GitHub authentication token is required.');
    }
    this.octokit = new Octokit({ auth: authToken });
    this.graphql = graphql.defaults({
      headers: { authorization: `token ${authToken}` },
    });
  }

  // --- Issues ---

  async createIssue(params: CreateIssueParams) {
    try {
      const { data: issue } = await this.octokit.issues.create(params);
      return issue;
    } catch (error) {
      throw new ClientApiError(
        `Failed to create issue: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async listIssues(params: RepoInfo & { state?: 'open' | 'closed' | 'all' }) {
    try {
      const { data: issues } = await this.octokit.issues.listForRepo(params);
      return issues;
    } catch (error) {
      throw new ClientApiError(
        `Failed to list issues for ${params.owner}/${params.repo}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getIssue(params: RepoInfo & { issue_number: number }) {
    try {
      const { data: issue } = await this.octokit.issues.get(params);
      return issue;
    } catch (error) {
      throw new ClientApiError(
        `Failed to get issue #${params.issue_number}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // --- Pull Requests ---

  async createPullRequest(params: CreatePullRequestParams) {
    try {
      const { data: pullRequest } = await this.octokit.pulls.create(params);
      return pullRequest;
    } catch (error) {
      throw new ClientApiError(
        `Failed to create pull request: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async listPullRequests(
    params: RepoInfo & { state?: 'open' | 'closed' | 'all' },
  ) {
    try {
      const { data: prs } = await this.octokit.pulls.list(params);
      return prs;
    } catch (error) {
      throw new ClientApiError(
        `Failed to list pull requests for ${params.owner}/${params.repo}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getPullRequest(params: RepoInfo & { pull_number: number }) {
    try {
      const { data: pr } = await this.octokit.pulls.get(params);
      return pr;
    } catch (error) {
      throw new ClientApiError(
        `Failed to get pull request #${params.pull_number}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // --- Projects, Discussions, and Teams (Advanced) ---
  // These features are often best managed via the GitHub GraphQL API for full functionality.
  // The methods below are placeholders or use the REST API where available.

  /**
   * NOTE: GitHub Projects (V2) are primarily managed via the GraphQL API.
   * The REST API has limited support. This is a placeholder for a potential
   * GraphQL implementation.
   */
  // Projects API removed in newer Octokit versions
  // async listProjects(params: RepoInfo) {
  //   console.warn(
  //     'This method lists classic projects. For Projects V2, GraphQL is recommended.',
  //   );
  //   try {
  //     const { data: projects } =
  //       await this.octokit.projects.listForRepo(params);
  //     return projects;
  //   } catch (error) {
  //     throw new ClientApiError(`Failed to list projects: ${error instanceof Error ? error.message : String(error)}`);
  //   }
  // }

  /**
   * NOTE: GitHub Discussions are managed via the GraphQL API.
   * There is no REST API endpoint for discussions.
   * This method is commented out until GraphQL types are generated.
   */
  // async listDiscussions(params: any) {
  //   try {
  //     const response = await this.graphql(
  //       '', // ListDiscussionsDocument,
  //       params,
  //     );
  //     // The response is now fully typed, and we can safely access nested properties.
  //     // The optional chaining (`?.`) is good practice for API responses.
  //     return (response as any).repository?.discussions;
  //   } catch (error: any) {
  //     throw new ClientApiError(`Failed to list discussions: ${error instanceof Error ? error.message : String(error)}`);
  //   }
  // }

  async listTeams(params: { org: string }) {
    try {
      const { data: teams } = await this.octokit.teams.list({
        org: params.org,
      });
      return teams;
    } catch (error) {
      throw new ClientApiError(
        `Failed to list teams for org ${params.org}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async listTeamMembers(params: { org: string; team_slug: string }) {
    try {
      const { data: members } =
        await this.octokit.teams.listMembersInOrg(params);
      return members;
    } catch (error) {
      throw new ClientApiError(
        `Failed to list members for team ${params.team_slug}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

/**
 * Default client instance (expects GITHUB_TOKEN environment variable).
 * This is useful for server-side operations.
 */
export const githubClient = (() => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.warn(
      'Default GitHub client not created: GITHUB_TOKEN environment variable is not set.',
    );
    return null;
  }
  return new GitHubClient(token);
})();
