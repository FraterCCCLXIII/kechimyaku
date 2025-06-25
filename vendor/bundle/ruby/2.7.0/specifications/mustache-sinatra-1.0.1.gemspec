# -*- encoding: utf-8 -*-
# stub: mustache-sinatra 1.0.1 ruby lib

Gem::Specification.new do |s|
  s.name = "mustache-sinatra".freeze
  s.version = "1.0.1"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Ricardo Mendes".freeze]
  s.date = "2015-01-25"
  s.description = "Mustache support for Sinatra applications".freeze
  s.email = ["rokusu@gmail.com".freeze]
  s.homepage = "https://github.com/mustache/mustache-sinatra".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.1.6".freeze
  s.summary = "Mustache support for Sinatra applications".freeze

  s.installed_by_version = "3.1.6" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_development_dependency(%q<bundler>.freeze, ["~> 1.7"])
    s.add_development_dependency(%q<rake>.freeze, ["~> 10.0"])
    s.add_runtime_dependency(%q<mustache>.freeze, ["<= 0.99.8"])
  else
    s.add_dependency(%q<bundler>.freeze, ["~> 1.7"])
    s.add_dependency(%q<rake>.freeze, ["~> 10.0"])
    s.add_dependency(%q<mustache>.freeze, ["<= 0.99.8"])
  end
end
