# Kechimyaku - Zen Lineage Tree Visualization

An interactive visualization of Zen master lineages with integrated wiki functionality powered by GitHub.

## Features

- **Interactive Lineage Tree**: D3.js-powered visualization of Zen master relationships
- **GitHub-Integrated Wiki**: Edit wiki content directly through GitHub with full version control
- **Authentication**: GitHub OAuth for secure editing
- **Responsive Design**: Modern UI that works on all devices
- **Search Functionality**: Find masters quickly with typeahead search
- **Admin Interface**: Manage masters and relationships

## Setup Instructions

### 1. Prerequisites

- Ruby 2.7+
- Git
- GitHub account

### 2. Clone and Install

```bash
git clone https://github.com/paulbloch/kechimyaku.git
cd kechimyaku
bundle install
```

### 3. GitHub Configuration

#### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Kechimyaku
   - **Homepage URL**: `http://localhost:9393`
   - **Authorization callback URL**: `http://localhost:9393/auth/github/callback`
4. Copy the Client ID and Client Secret

#### Create Personal Access Token

1. Go to [GitHub Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (for wiki access)
4. Copy the token

#### Configure Environment

Create a `.env` file in the project root:

```bash
# GitHub OAuth App credentials
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# GitHub Personal Access Token
GITHUB_TOKEN=your_github_personal_access_token_here

# GitHub Repository (format: owner/repo)
GITHUB_REPO=paulbloch/kechimyaku

# Session secret for cookies
SESSION_SECRET=your_random_session_secret_here
```

### 4. Database Setup

```bash
bundle exec rake db:create
bundle exec rake db:migrate
```

### 5. Start the Server

```bash
bundle exec shotgun -p 9393
```

Visit `http://localhost:9393` to see the application.

## Wiki System

### How It Works

The wiki system integrates with GitHub's API to provide:

- **Version Control**: All changes are tracked in Git with full history
- **Collaboration**: Multiple users can edit with proper attribution
- **Backup**: Content is stored in GitHub's wiki repository
- **Fallback**: Local file system backup if GitHub is unavailable

### Editing Wiki Content

1. **Authentication**: Click "Login with GitHub" to authenticate
2. **Edit**: Click on any master's name in the tree to open the wiki drawer
3. **Save**: Changes are committed to GitHub with your commit message
4. **History**: View full edit history with links to GitHub

### Wiki File Structure

Wiki files are stored in your GitHub repository's wiki as Markdown files:
- `Bodhidharma.md`
- `Huineng.md`
- `etc...`

## API Endpoints

### Wiki API

- `GET /api/wiki/:master_name` - Get wiki content and metadata
- `GET /api/wiki/:master_name/history` - Get edit history
- `GET /wiki/edit/:master_name` - Edit wiki page (requires auth)
- `POST /wiki/edit/:master_name` - Save wiki changes (requires auth)
- `GET /wiki/view/:master_name` - View wiki page

### Authentication

- `GET /auth/github` - Start GitHub OAuth flow
- `GET /auth/github/callback` - OAuth callback
- `GET /logout` - Logout

## Development

### Project Structure

```
kechimyaku/
├── config/           # Configuration files
├── db/              # Database migrations
├── public/          # Static assets (JS, CSS, images)
├── views/           # Slim templates
├── wiki/            # Local wiki files (fallback)
├── kechimyaku.rb    # Main application
└── Gemfile          # Dependencies
```

### Adding New Features

1. **Database Changes**: Create migrations in `db/migrate/`
2. **Routes**: Add to `kechimyaku.rb`
3. **Views**: Create Slim templates in `views/`
4. **Styling**: Update `public/stylesheets/app.css`
5. **JavaScript**: Update `public/javascripts/`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. See LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- Contact the maintainers

## About

**Kechimyaku** (血脈) means "bloodline" or "lineage" in Japanese, referring to the transmission of Zen teachings from master to student through generations.

Created by Paul Bloch and Ken Miller as a tool for exploring and preserving the rich history of Zen Buddhism. 