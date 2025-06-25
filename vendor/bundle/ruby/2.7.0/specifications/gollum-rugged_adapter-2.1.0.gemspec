# -*- encoding: utf-8 -*-
# stub: gollum-rugged_adapter 2.1.0 ruby lib

Gem::Specification.new do |s|
  s.name = "gollum-rugged_adapter".freeze
  s.version = "2.1.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Bart Kamphorst, Dawa Ometto".freeze]
  s.date = "2023-03-12"
  s.description = "Adapter for Gollum to use Rugged (libgit2) at the backend.".freeze
  s.email = ["repotag-dev@googlegroups.com".freeze]
  s.homepage = "https://github.com/gollum/rugged_adapter".freeze
  s.licenses = ["MIT".freeze]
  s.rubygems_version = "3.1.6".freeze
  s.summary = "Adapter for Gollum to use Rugged (libgit2) at the backend.".freeze

  s.installed_by_version = "3.1.6" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_runtime_dependency(%q<rugged>.freeze, ["~> 1.5"])
    s.add_runtime_dependency(%q<mime-types>.freeze, ["~> 3.4"])
    s.add_development_dependency(%q<rspec>.freeze, ["= 3.4.0"])
  else
    s.add_dependency(%q<rugged>.freeze, ["~> 1.5"])
    s.add_dependency(%q<mime-types>.freeze, ["~> 3.4"])
    s.add_dependency(%q<rspec>.freeze, ["= 3.4.0"])
  end
end
