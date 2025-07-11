# -*- encoding: utf-8 -*-
# stub: wikipedia-client 1.8.0 ruby lib lib

Gem::Specification.new do |s|
  s.name = "wikipedia-client".freeze
  s.version = "1.8.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze, "lib".freeze]
  s.authors = ["Cyril David".freeze, "Ken Pratt".freeze, "Mike Haugland".freeze, "Aishwarya Subramanian".freeze, "Pietro Menna".freeze, "Sophie Rapoport".freeze]
  s.date = "2017-12-01"
  s.description = "Ruby client for the Wikipedia API".freeze
  s.email = "ken@kenpratt.net".freeze
  s.extra_rdoc_files = ["README.textile".freeze]
  s.files = ["README.textile".freeze]
  s.homepage = "http://github.com/kenpratt/wikipedia-client".freeze
  s.licenses = ["MIT".freeze]
  s.rdoc_options = ["--title".freeze, "wikipedia-client".freeze, "--main".freeze, "-ri".freeze]
  s.rubygems_version = "3.1.6".freeze
  s.summary = "Ruby client for the Wikipedia API".freeze

  s.installed_by_version = "3.1.6" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 3
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_development_dependency(%q<rake>.freeze, ["~> 10.1"])
    s.add_development_dependency(%q<rspec>.freeze, ["~> 3.0"])
    s.add_development_dependency(%q<rdoc>.freeze, ["~> 4.0"])
    s.add_development_dependency(%q<jeweler>.freeze, ["~> 1.8"])
    s.add_development_dependency(%q<rubocop>.freeze, ["~> 0.48"])
    s.add_development_dependency(%q<thoughtbot-shoulda>.freeze, ["~> 2.11", ">= 2.11"])
  else
    s.add_dependency(%q<rake>.freeze, ["~> 10.1"])
    s.add_dependency(%q<rspec>.freeze, ["~> 3.0"])
    s.add_dependency(%q<rdoc>.freeze, ["~> 4.0"])
    s.add_dependency(%q<jeweler>.freeze, ["~> 1.8"])
    s.add_dependency(%q<rubocop>.freeze, ["~> 0.48"])
    s.add_dependency(%q<thoughtbot-shoulda>.freeze, ["~> 2.11", ">= 2.11"])
  end
end
