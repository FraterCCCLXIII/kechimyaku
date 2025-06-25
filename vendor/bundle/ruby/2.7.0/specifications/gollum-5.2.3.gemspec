# -*- encoding: utf-8 -*-
# stub: gollum 5.2.3 ruby lib

Gem::Specification.new do |s|
  s.name = "gollum".freeze
  s.version = "5.2.3"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Tom Preston-Werner".freeze, "Rick Olson".freeze]
  s.date = "2021-04-18"
  s.description = "A simple, Git-powered wiki with a sweet API and local frontend.".freeze
  s.email = "tom@github.com".freeze
  s.executables = ["gollum".freeze, "gollum-migrate-tags".freeze]
  s.extra_rdoc_files = ["README.md".freeze, "LICENSE".freeze]
  s.files = ["LICENSE".freeze, "README.md".freeze, "bin/gollum".freeze, "bin/gollum-migrate-tags".freeze]
  s.homepage = "http://github.com/gollum/gollum".freeze
  s.licenses = ["MIT".freeze]
  s.rdoc_options = ["--charset=UTF-8".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9".freeze)
  s.rubygems_version = "3.1.6".freeze
  s.summary = "A simple, Git-powered wiki.".freeze

  s.installed_by_version = "3.1.6" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 2
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_runtime_dependency(%q<gollum-lib>.freeze, ["~> 5.1"])
    s.add_runtime_dependency(%q<kramdown>.freeze, ["~> 2.3"])
    s.add_runtime_dependency(%q<kramdown-parser-gfm>.freeze, ["~> 1.1.0"])
    s.add_runtime_dependency(%q<sinatra>.freeze, ["~> 2.0"])
    s.add_runtime_dependency(%q<sinatra-contrib>.freeze, ["~> 2.0"])
    s.add_runtime_dependency(%q<mustache-sinatra>.freeze, ["~> 1.0"])
    s.add_runtime_dependency(%q<useragent>.freeze, ["~> 0.16.2"])
    s.add_runtime_dependency(%q<gemojione>.freeze, ["~> 4.1"])
    s.add_runtime_dependency(%q<octicons>.freeze, ["~> 12.0"])
    s.add_runtime_dependency(%q<sprockets>.freeze, ["~> 3.7"])
    s.add_runtime_dependency(%q<sass>.freeze, ["~> 3.5"])
    s.add_runtime_dependency(%q<uglifier>.freeze, ["~> 4.2"])
    s.add_runtime_dependency(%q<sprockets-helpers>.freeze, ["~> 1.2"])
    s.add_runtime_dependency(%q<rss>.freeze, ["~> 0.2.9"])
    s.add_runtime_dependency(%q<therubyrhino>.freeze, ["~> 2.1.0"])
    s.add_runtime_dependency(%q<webrick>.freeze, ["~> 1.7"])
    s.add_development_dependency(%q<rack-test>.freeze, ["~> 0.6.3"])
    s.add_development_dependency(%q<shoulda>.freeze, ["~> 3.6.0"])
    s.add_development_dependency(%q<minitest-reporters>.freeze, ["~> 1.3.6"])
    s.add_development_dependency(%q<twitter_cldr>.freeze, ["~> 3.2.0"])
    s.add_development_dependency(%q<mocha>.freeze, ["~> 1.8.0"])
    s.add_development_dependency(%q<test-unit>.freeze, ["~> 3.3.0"])
  else
    s.add_dependency(%q<gollum-lib>.freeze, ["~> 5.1"])
    s.add_dependency(%q<kramdown>.freeze, ["~> 2.3"])
    s.add_dependency(%q<kramdown-parser-gfm>.freeze, ["~> 1.1.0"])
    s.add_dependency(%q<sinatra>.freeze, ["~> 2.0"])
    s.add_dependency(%q<sinatra-contrib>.freeze, ["~> 2.0"])
    s.add_dependency(%q<mustache-sinatra>.freeze, ["~> 1.0"])
    s.add_dependency(%q<useragent>.freeze, ["~> 0.16.2"])
    s.add_dependency(%q<gemojione>.freeze, ["~> 4.1"])
    s.add_dependency(%q<octicons>.freeze, ["~> 12.0"])
    s.add_dependency(%q<sprockets>.freeze, ["~> 3.7"])
    s.add_dependency(%q<sass>.freeze, ["~> 3.5"])
    s.add_dependency(%q<uglifier>.freeze, ["~> 4.2"])
    s.add_dependency(%q<sprockets-helpers>.freeze, ["~> 1.2"])
    s.add_dependency(%q<rss>.freeze, ["~> 0.2.9"])
    s.add_dependency(%q<therubyrhino>.freeze, ["~> 2.1.0"])
    s.add_dependency(%q<webrick>.freeze, ["~> 1.7"])
    s.add_dependency(%q<rack-test>.freeze, ["~> 0.6.3"])
    s.add_dependency(%q<shoulda>.freeze, ["~> 3.6.0"])
    s.add_dependency(%q<minitest-reporters>.freeze, ["~> 1.3.6"])
    s.add_dependency(%q<twitter_cldr>.freeze, ["~> 3.2.0"])
    s.add_dependency(%q<mocha>.freeze, ["~> 1.8.0"])
    s.add_dependency(%q<test-unit>.freeze, ["~> 3.3.0"])
  end
end
