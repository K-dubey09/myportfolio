import { Octokit } from '@octokit/rest';

/**
 * GitHub Integration Service
 * 
 * Handles GitHub API operations:
 * - Repository cloning/fetching
 * - Push/pull changes
 * - Branch management
 * - Authentication
 */

class GitHubService {
  constructor(accessToken) {
    this.octokit = new Octokit({
      auth: accessToken
    });
  }

  /**
   * Fetch repository contents
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name (default: main)
   * @param {string} path - Path within repo (default: root)
   * @returns {Promise<Array>} - Array of files/folders
   */
  async fetchRepoContents(owner, repo, branch = 'main', path = '') {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch
      });

      // If it's a single file
      if (!Array.isArray(data)) {
        const content = data.content 
          ? Buffer.from(data.content, 'base64').toString('utf-8')
          : '';
        return [{
          id: data.sha,
          name: data.name,
          path: data.path,
          type: 'file',
          content,
          size: data.size,
          sha: data.sha
        }];
      }

      // If it's a directory
      const items = await Promise.all(
        data.map(async (item) => {
          if (item.type === 'dir') {
            // Recursively fetch folder contents
            const children = await this.fetchRepoContents(owner, repo, branch, item.path);
            return {
              id: item.sha,
              name: item.name,
              path: item.path,
              type: 'folder',
              children,
              size: 0
            };
          } else {
            // Fetch file content
            const fileData = await this.octokit.repos.getContent({
              owner,
              repo,
              path: item.path,
              ref: branch
            });
            
            const content = fileData.data.content
              ? Buffer.from(fileData.data.content, 'base64').toString('utf-8')
              : '';
            
            return {
              id: item.sha,
              name: item.name,
              path: item.path,
              type: 'file',
              content,
              size: item.size,
              sha: item.sha
            };
          }
        })
      );

      return items;
    } catch (error) {
      console.error('Error fetching repo contents:', error);
      throw new Error(`Failed to fetch repository: ${error.message}`);
    }
  }

  /**
   * Create or update file in repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @param {string} content - File content
   * @param {string} message - Commit message
   * @param {string} branch - Branch name
   * @param {string} sha - File SHA (for updates)
   * @returns {Promise<Object>} - Updated file data
   */
  async createOrUpdateFile(owner, repo, path, content, message, branch = 'main', sha = null) {
    try {
      const params = {
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch
      };

      if (sha) {
        params.sha = sha;
      }

      const { data } = await this.octokit.repos.createOrUpdateFileContents(params);
      return data;
    } catch (error) {
      console.error('Error creating/updating file:', error);
      throw new Error(`Failed to update file: ${error.message}`);
    }
  }

  /**
   * Delete file from repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - File path
   * @param {string} message - Commit message
   * @param {string} sha - File SHA
   * @param {string} branch - Branch name
   * @returns {Promise<Object>} - Delete result
   */
  async deleteFile(owner, repo, path, message, sha, branch = 'main') {
    try {
      const { data } = await this.octokit.repos.deleteFile({
        owner,
        repo,
        path,
        message,
        sha,
        branch
      });
      return data;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Get repository branches
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Array>} - List of branches
   */
  async getBranches(owner, repo) {
    try {
      const { data } = await this.octokit.repos.listBranches({
        owner,
        repo
      });
      return data.map(branch => ({
        name: branch.name,
        sha: branch.commit.sha,
        protected: branch.protected
      }));
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw new Error(`Failed to fetch branches: ${error.message}`);
    }
  }

  /**
   * Get latest commit SHA
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @returns {Promise<string>} - Commit SHA
   */
  async getLatestCommit(owner, repo, branch = 'main') {
    try {
      const { data } = await this.octokit.repos.getBranch({
        owner,
        repo,
        branch
      });
      return data.commit.sha;
    } catch (error) {
      console.error('Error fetching latest commit:', error);
      throw new Error(`Failed to fetch latest commit: ${error.message}`);
    }
  }

  /**
   * Get authenticated user info
   * @returns {Promise<Object>} - User data
   */
  async getAuthenticatedUser() {
    try {
      const { data } = await this.octokit.users.getAuthenticated();
      return {
        login: data.login,
        name: data.name,
        email: data.email,
        avatar: data.avatar_url
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error(`Failed to authenticate: ${error.message}`);
    }
  }

  /**
   * List user repositories
   * @returns {Promise<Array>} - List of repositories
   */
  async listUserRepos() {
    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 100
      });
      return data.map(repo => ({
        name: repo.name,
        fullName: repo.full_name,
        owner: repo.owner.login,
        url: repo.html_url,
        description: repo.description,
        private: repo.private,
        defaultBranch: repo.default_branch
      }));
    } catch (error) {
      console.error('Error listing repos:', error);
      throw new Error(`Failed to list repositories: ${error.message}`);
    }
  }
}

export default GitHubService;
