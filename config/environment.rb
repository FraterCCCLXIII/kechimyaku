require 'sinatra/activerecord'
require 'require_all'

configure :development do
  set :database, 'sqlite3:db/database.db'
end

configure :production do
  set :database, 'sqlite3:db/database.db'
end

# Load all models
require_all 'kechimyaku'