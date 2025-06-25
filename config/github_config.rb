# GitHub API Configuration
# Copy this file to config/github_config.rb and fill in your values

module GitHubConfig
  # GitHub OAuth App credentials
  # Get these from https://github.com/settings/developers
  CLIENT_ID = ENV['GITHUB_CLIENT_ID'] || 'your_github_client_id_here'
  CLIENT_SECRET = ENV['GITHUB_CLIENT_SECRET'] || 'your_github_client_secret_here'
  
  # GitHub Personal Access Token (for server-side operations)
  # Generate at https://github.com/settings/tokens
  TOKEN = ENV['GITHUB_TOKEN'] || 'your_github_personal_access_token_here'
  
  # GitHub Repository (format: owner/repo)
  REPO = ENV['GITHUB_REPO'] || 'paulbloch/kechimyaku'
  
  # Session secret for cookies
  SESSION_SECRET = ENV['SESSION_SECRET'] || 'your_session_secret_here'
end 