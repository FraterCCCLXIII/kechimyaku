# -*- encoding: utf-8 -*-
# stub: useragent 0.16.11 ruby lib

Gem::Specification.new do |s|
  s.name = "useragent".freeze
  s.version = "0.16.11"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Joshua Peek".freeze, "Garry Shutler".freeze]
  s.date = "2024-12-04"
  s.description = "HTTP User Agent parser".freeze
  s.email = "garry@robustsoftware.co.uk".freeze
  s.homepage = "https://github.com/gshutler/useragent".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.1.6".freeze
  s.summary = "HTTP User Agent parser".freeze

  s.installed_by_version = "3.1.6" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_development_dependency(%q<rake>.freeze, ["~> 13.0"])
    s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0"])
  else
    s.add_dependency(%q<rake>.freeze, ["~> 13.0"])
    s.add_dependency(%q<rspec>.freeze, ["~> 3.0"])
  end
end
