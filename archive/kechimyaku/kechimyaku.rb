# ~*~ encoding: utf-8 ~*~
require "sinatra/base"
require "sinatra/reloader"
require "slim"
require 'json'
require 'sinatra/activerecord'
require 'wikipedia'
require 'fileutils'

class Kechimyaku < Sinatra::Base
  register Sinatra::ActiveRecordExtension

  enable :sessions
  set :session_secret, 'your-secret-key-here'
  set :database, ENV.fetch('DATABASE_URL', 'sqlite3:db/database.db')

  # Simple file-based wiki system
  def wiki_dir
    "wiki_repo"
  end

  def ensure_wiki_dir
    FileUtils.mkdir_p(wiki_dir) unless Dir.exist?(wiki_dir)
  end

  def get_master_name_wiki(master)
    master.name.gsub(' ', '-').downcase
  end

  def get_wiki_content(master_name)
    ensure_wiki_dir
    master_name_wiki = master_name.gsub(' ', '-').downcase
    file_path = File.join(wiki_dir, "#{master_name_wiki}.md")
    
    if File.exist?(file_path)
      File.read(file_path)
    else
      ''
    end
  rescue => e
    puts "Error getting wiki content for #{master_name}: #{e.message}"
    ''
  end

  def save_wiki_content(master_name, content)
    ensure_wiki_dir
    master_name_wiki = master_name.gsub(' ', '-').downcase
    file_path = File.join(wiki_dir, "#{master_name_wiki}.md")
    
    File.write(file_path, content)
    true
  rescue => e
    puts "Error saving wiki content for #{master_name}: #{e.message}"
    false
  end

  def get_wiki_history(master_name)
    # Simple history - just return basic info for now
    master_name_wiki = master_name.gsub(' ', '-').downcase
    file_path = File.join(wiki_dir, "#{master_name_wiki}.md")
    
    if File.exist?(file_path)
      stat = File.stat(file_path)
      [{
        id: '1',
        message: 'Latest version',
        author: 'Local Editor',
        date: stat.mtime.strftime('%Y-%m-%d %H:%M:%S'),
        url: '#'
      }]
    else
      []
    end
  end

  # Authentication helpers
  def authenticated?
    session[:user_id]
  end

  def current_user
    session[:username] || 'Unknown User'
  end

  def require_auth
    unless authenticated?
      redirect '/login'
    end
  end

  # Routes
  get '/' do
    slim :home
  end

  get '/teachers' do
    @masters = Master.all
    slim :teachers
  end

  get '/about' do
    slim :about
  end

  get '/api/masters' do
    content_type :json
    root_master = Master.find_by(is_root: true) || Master.first
    halt 404, { error: 'No masters found' }.to_json unless root_master

    generate_master_tree(root_master).to_json
  end

  # Authentication routes
  get '/login' do
    slim :login
  end

  post '/login' do
    username = params[:username]
    password = params[:password]
    
    # Simple authentication - you can replace this with a proper user system
    if username == 'admin' && password == 'password'
      session[:user_id] = 1
      session[:username] = username
      redirect '/admin/masters'
    else
      @error = 'Invalid username or password'
      slim :login
    end
  end

  get '/logout' do
    session.clear
    redirect '/'
  end

  # Wiki routes
  get '/wiki/:master_id/edit' do
    require_auth
    @master = Master.find(params[:master_id])
    @master_name = @master.name
    @wiki_content = get_wiki_content(@master_name)
    slim :'wiki/edit'
  end

  post '/wiki/:master_id/save' do
    require_auth
    @master = Master.find(params[:master_id])
    @master_name = @master.name
    content = params[:content]
    
    if save_wiki_content(@master_name, content)
      redirect "/masters/#{@master.id}/edit"
    else
      @error = 'Failed to save wiki content'
      @wiki_content = content
      slim :'wiki/edit'
    end
  end

  # Master routes
  get '/masters/:id/edit' do
    require_auth
    @master = Master.find(params[:id])
    @master_name = @master.name
    @wiki_content = get_wiki_content(@master_name)
    slim :'masters/unified'
  end

  post '/masters/:id/update' do
    require_auth
    @master = Master.find(params[:id])
    
    @master.name = params[:name]
    @master.birth_year = params[:birth_year]
    @master.death_year = params[:death_year]
    @master.bio = params[:bio]
    
    if @master.save
      # Save wiki content
      wiki_content = params[:wiki_content]
      save_wiki_content(@master.name, wiki_content) if wiki_content
      
      redirect '/teachers'
    else
      @error = 'Failed to update master'
      @master_name = @master.name
      @wiki_content = get_wiki_content(@master_name)
      slim :'masters/unified'
    end
  end

  # Admin routes
  get '/admin/masters' do
    require_auth
    @masters = Master.all
    slim :'admin/masters/masters'
  end

  get '/admin/masters/add' do
    require_auth
    slim :'admin/masters/add'
  end

  post '/admin/masters/create' do
    require_auth
    @master = Master.new(
      name: params[:name],
      birth_year: params[:birth_year],
      death_year: params[:death_year],
      bio: params[:bio],
      parent_id: params[:parent_id]
    )
    
    if @master.save
      redirect '/admin/masters'
    else
      @error = 'Failed to create master'
      slim :'admin/masters/add'
    end
  end

  get '/admin/masters/:id/edit' do
    require_auth
    @master = Master.find(params[:id])
    slim :'admin/masters/edit'
  end

  post '/admin/masters/:id/update' do
    require_auth
    @master = Master.find(params[:id])
    
    @master.name = params[:name]
    @master.birth_year = params[:birth_year]
    @master.death_year = params[:death_year]
    @master.bio = params[:bio]
    @master.parent_id = params[:parent_id]
    
    if @master.save
      redirect '/admin/masters'
    else
      @error = 'Failed to update master'
      slim :'admin/masters/edit'
    end
  end

  post '/admin/masters/:id/delete' do
    require_auth
    @master = Master.find(params[:id])
    @master.destroy
    redirect '/admin/masters'
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
  if master.child_masters
    node[:children] = []

    master.child_masters.sort_by {|cm| cm.child_masters.size}.reverse!.each do |cm|
    #master.child_masters.each do |cm|
      node[:children].push(generate_master_tree(cm))
    end
  end

  return node
end

#HELPERS

def render_master_list(master, indent)
  Slim::Template.new("./views/admin/masters/partials/master_listing.slim", {}).render(Object.new, {master: master, indent: indent})
end


