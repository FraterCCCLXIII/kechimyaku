# ~*~ encoding: utf-8 ~*~
require "sinatra/base"
require "sinatra/reloader"
require "slim"
require 'json'
require 'sinatra/activerecord'
require 'wikipedia'
require 'fileutils'
require 'octokit'
require 'dotenv'

# Load environment variables
Dotenv.load

class Kechimyaku < Sinatra::Base
  register Sinatra::ActiveRecordExtension
  register Sinatra::Reloader

  # GitHub API configuration
  configure do
    set :github_client, Octokit::Client.new(
      access_token: ENV['GITHUB_TOKEN'],
      auto_paginate: true
    )
    set :github_repo, ENV['GITHUB_REPO'] || 'paulbloch/kechimyaku'
    set :github_wiki_repo, "#{settings.github_repo}.wiki"
  end

  # Authentication helpers
  helpers do
    def authenticated?
      session[:github_user] && session[:github_token]
    end

    def require_auth!
      unless authenticated?
        redirect '/auth/github'
      end
    end

    def current_user
      session[:github_user] if authenticated?
    end
  end

  # Wiki directory setup
  WIKI_DIR = File.join(Dir.pwd, 'wiki')
  FileUtils.mkdir_p(WIKI_DIR) unless Dir.exist?(WIKI_DIR)

  def get_master_name_wiki(master)
    master_name_wiki = master.name.gsub(' ', '-')
  end
  
  def sanitize_filename(filename)
    # Remove or replace problematic characters
    filename.gsub(/[^\w\-\.]/, '_')
  end
  
  def get_wiki_file_path(master_name)
    sanitized_name = sanitize_filename(master_name)
    File.join(WIKI_DIR, "#{sanitized_name}.md")
  end
  
  def get_wiki_content_from_github(master_name)
    begin
      filename = "#{sanitize_filename(master_name)}.md"
      content = settings.github_client.contents(settings.github_wiki_repo, path: filename)
      Base64.decode64(content.content)
    rescue Octokit::NotFound
      "# #{master_name}\n\nNo content yet. Start writing about this master..."
    rescue => e
      puts "GitHub API Error: #{e.message}"
      "# #{master_name}\n\nError loading content. Please try again later."
    end
  end

  def save_wiki_content_to_github(master_name, content, commit_message = nil)
    begin
      filename = "#{sanitize_filename(master_name)}.md"
      commit_message ||= "Update wiki for #{master_name}"

      # Get current file if it exists
      begin
        current_file = settings.github_client.contents(settings.github_wiki_repo, path: filename)
        sha = current_file.sha
      rescue Octokit::NotFound
        sha = nil
      end

      # Create or update file
      settings.github_client.create_contents(
        settings.github_wiki_repo,
        filename,
        commit_message,
        content,
        sha: sha
      )

      return { success: true, message: "Content saved successfully" }
    rescue => e
      puts "GitHub API Error: #{e.message}"
      return { success: false, message: "Error saving content: #{e.message}" }
    end
  end

  def get_wiki_history(master_name)
    begin
      filename = "#{sanitize_filename(master_name)}.md"
      commits = settings.github_client.commits(settings.github_wiki_repo, path: filename)
      
      commits.map do |commit|
        {
          sha: commit.sha,
          message: commit.commit.message,
          author: commit.commit.author.name,
          date: commit.commit.author.date,
          url: commit.html_url
        }
      end
    rescue => e
      puts "GitHub API Error: #{e.message}"
      []
    end
  end

  # Fallback to local file system if GitHub is not available
  def get_wiki_content(master_name)
    # Try GitHub first
    content = get_wiki_content_from_github(master_name)
    return content unless content.include?("Error loading content")
    
    # Fallback to local file
    file_path = get_wiki_file_path(master_name)
    if File.exist?(file_path)
      File.read(file_path)
    else
      "# #{master_name}\n\nNo content yet. Start writing about this master..."
    end
  end

  def save_wiki_content(master_name, content)
    # Try GitHub first
    result = save_wiki_content_to_github(master_name, content)
    return result if result[:success]
    
    # Fallback to local file
    file_path = get_wiki_file_path(master_name)
    File.write(file_path, content)
    { success: true, message: "Content saved locally" }
  end

  get '/?' do
    slim :home
  end

  get '/about/?' do
    slim :about
  end

  get '/api/masters/?' do
    @master = Master.where(is_root: true).first
    master_tree = generate_master_tree(@master)
    content_type :json 
    master_tree.to_json
  end

  get '/admin/?' do
    redirect :"admin/masters"  
  end

  get '/admin/masters/?:id?' do
    if (params[:id] != nil)
      puts params[:id]
      @master = Relationship.where(:child_master_id => params[:id]).first.parent_master    
    else
      @master = Master.where(is_root: true).first    
    end

    slim :"admin/masters/masters"  
  end

  get '/admin/masters/add/?:parent_id?' do
    @masters = Master.all
    @relationship_types = RelationshipType.all
    slim :"admin/masters/add"
  end

  post '/admin/masters/add/?' do
    new_master = Master.new
    new_master.name = params[:name]
    new_master.name_native = params[:name_native]
    new_master.year_born = params[:year_born]
    new_master.year_died = params[:year_died]
    new_master.location = params[:location]
    new_master.overview = params[:overview]

    if (params[:parent_id] == "")
      new_master.is_root = true
      new_master.save
    else
      new_master.is_root = false
      new_master.save
      
      new_relationship = Relationship.new
      new_relationship.parent_master_id = params[:parent_id]
      new_relationship.child_master_id = new_master.id
      new_relationship.relationship_type_id = params[:relationship_type_id]
      new_relationship.save
    end

    redirect "admin/masters/" + new_master.id.to_s
  end

  get '/admin/masters/edit/:id' do
    @master = Master.find(params[:id])
    @masters = Master.all
    @relationship = Relationship.where(child_master_id: @master.id).first 
    @relationship_types = RelationshipType.all

    slim :"/admin/masters/edit"
  end

  post '/admin/masters/edit/:id' do
    master = Master.find(params[:id])
    master.name = params[:name]
    master.name_native = params[:name_native]
    master.year_born = params[:year_born]
    master.year_died = params[:year_died]
    master.location = params[:location]
    master.overview = params[:overview]

    relationship = Relationship.where(child_master_id: master.id).first 

    if (params[:parent_id] == "")
      master.is_root = true
      if (relationship != nil)
        relationship.delete
      end
      master.save
    else
      master.is_root = false
      master.save

      if (relationship == nil)
        relationship = Relationship.new
      end
    
      relationship.parent_master_id = params[:parent_id]
      relationship.child_master_id = master.id
      relationship.relationship_type_id = params[:relationship_type_id]
      relationship.save
    end

    redirect :"admin/masters"  
  end

  get '/admin/masters/delete/:id' do
    master = Master.find(params[:id])
    master.delete
    redirect :"admin/masters"  
  end

  get '/admin/teachers' do
    @masters = Master.all.order(:name)
    slim :"admin/masters/teachers_list"
  end

  # Wiki routes with authentication
  get '/wiki/edit/:master_name' do
    require_auth!
    @master_name = params[:master_name].gsub('_', ' ')
    @content = get_wiki_content(@master_name)
    @history = get_wiki_history(@master_name)
    slim :"wiki/edit"
  end

  post '/wiki/edit/:master_name' do
    require_auth!
    master_name = params[:master_name].gsub('_', ' ')
    content = params[:content]
    commit_message = params[:commit_message] || "Update wiki for #{master_name}"
    
    result = save_wiki_content(master_name, content)
    
    if result[:success]
      flash[:success] = result[:message]
    else
      flash[:error] = result[:message]
    end
    
    redirect "/wiki/view/#{params[:master_name]}"
  end

  get '/wiki/view/:master_name' do
    @master_name = params[:master_name].gsub('_', ' ')
    @content = get_wiki_content(@master_name)
    @history = get_wiki_history(@master_name)
    @can_edit = authenticated?
    slim :"wiki/view"
  end

  # API endpoint to get wiki content for drawer
  get '/api/wiki/:master_name' do
    content_type :json
    master_name = params[:master_name]
    
    # Convert sanitized name back to original format for display
    original_name = master_name.gsub('_', ' ')
    
    # Get wiki content
    wiki_content = get_wiki_content(original_name)
    history = get_wiki_history(original_name)
    
    if wiki_content
      { 
        content: wiki_content, 
        master_name: original_name,
        history: history,
        can_edit: authenticated?
      }.to_json
    else
      { 
        content: nil, 
        master_name: original_name,
        history: [],
        can_edit: authenticated?
      }.to_json
    end
  end

  # API endpoint to get wiki history
  get '/api/wiki/:master_name/history' do
    content_type :json
    master_name = params[:master_name].gsub('_', ' ')
    history = get_wiki_history(master_name)
    { history: history }.to_json
  end

  # GitHub OAuth routes
  get '/auth/github' do
    client_id = ENV['GITHUB_CLIENT_ID']
    redirect_uri = "#{request.base_url}/auth/github/callback"
    scope = 'repo'
    
    redirect "https://github.com/login/oauth/authorize?client_id=#{client_id}&redirect_uri=#{redirect_uri}&scope=#{scope}"
  end

  get '/auth/github/callback' do
    code = params[:code]
    client_id = ENV['GITHUB_CLIENT_ID']
    client_secret = ENV['GITHUB_CLIENT_SECRET']
    redirect_uri = "#{request.base_url}/auth/github/callback"

    # Exchange code for access token
    response = Net::HTTP.post_form(URI('https://github.com/login/oauth/access_token'), {
      client_id: client_id,
      client_secret: client_secret,
      code: code,
      redirect_uri: redirect_uri
    })

    token = response.body.split('&').find { |param| param.start_with?('access_token=') }.split('=').last

    # Get user info
    client = Octokit::Client.new(access_token: token)
    user = client.user

    session[:github_user] = user.login
    session[:github_token] = token

    redirect '/'
  end

  get '/logout' do
    session.clear
    redirect '/'
  end

  # Markdown rendering helper
  def render_markdown(content)
    return '' unless content
    
    # Simple markdown to HTML conversion
    html = content
    
    # Headings
    html = html.gsub(/^# (.*$)/, '<h1 class="text-2xl font-bold mb-4">\1</h1>')
    html = html.gsub(/^## (.*$)/, '<h2 class="text-xl font-semibold mb-3 mt-6">\1</h2>')
    html = html.gsub(/^### (.*$)/, '<h3 class="text-lg font-medium mb-2 mt-4">\1</h3>')
    
    # Bold and italic
    html = html.gsub(/\*\*(.*?)\*\*/, '<strong class="font-semibold">\1</strong>')
    html = html.gsub(/\*(.*?)\*/, '<em class="italic">\1</em>')
    
    # Links
    html = html.gsub(/\[([^\]]+)\]\(([^)]+)\)/, '<a href="\2" class="text-blue-600 hover:text-blue-700 underline" target="_blank">\1</a>')
    
    # Code blocks
    html = html.gsub(/```([\s\S]*?)```/, '<pre class="bg-gray-100 p-4 rounded-md overflow-x-auto my-4"><code>\1</code></pre>')
    html = html.gsub(/`([^`]+)`/, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">\1</code>')
    
    # Blockquotes
    html = html.gsub(/^> (.*$)/, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">\1</blockquote>')
    
    # Lists
    html = html.gsub(/^[\*\-] (.*$)/, '<li class="ml-4 mb-1">\1</li>')
    html = html.gsub(/^\d+\. (.*$)/, '<li class="ml-4 mb-1">\1</li>')
    
    # Wrap lists
    html = html.gsub(/(<li.*<\/li>)/m, '<ul class="my-4">\1</ul>')
    
    # Paragraphs
    html = html.gsub(/\n\n/, '</p><p class="mb-3 leading-relaxed">')
    html = html.gsub(/\n/, '<br>')
    
    # Wrap in paragraph tags if not already wrapped
    unless html.start_with?('<h') || html.start_with?('<p') || html.start_with?('<ul') || html.start_with?('<pre') || html.start_with?('<blockquote')
      html = '<p class="mb-3 leading-relaxed">' + html + '</p>'
    end
    
    # Clean up empty paragraphs
    html = html.gsub(/<p[^>]*><\/p>/, '')
    html = html.gsub(/<p[^>]*><br><\/p>/, '')
    
    html
  end

end

#ENTITIES

class Master < ActiveRecord::Base
  has_many :relationships, foreign_key: :parent_master_id
  has_many :child_masters, through: :relationships, source: :child_master
  
end

class Relationship < ActiveRecord::Base
  belongs_to :child_master, class_name: "Master", foreign_key: :child_master_id 
  belongs_to :parent_master, class_name: "Master", foreign_key: :parent_master_id 
end

class RelationshipType < ActiveRecord::Base
end

#FUNCTIONS

def generate_master_tree(master)
  node = {}
  node[:master] = master
  node[:children] = []
  
  master.child_masters.each do |child_master|
    child_node = generate_master_tree(child_master)
    node[:children] << child_node
  end
  
  node
end

def render_master_list(master, indent)
  Slim::Template.new("./views/admin/masters/partials/master_listing.slim", {}).render(Object.new, {master: master, indent: indent})
end


