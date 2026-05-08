require "sinatra"
require "sinatra/reloader"
require "slim"
require 'json'
require 'sinatra/activerecord'

configure :development do
  set :database, 'sqlite3:db/database.db'
end