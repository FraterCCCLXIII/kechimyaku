# -*- encoding: utf-8 -*-
# stub: gollum-lib 5.2.4 ruby lib

Gem::Specification.new do |s|
  s.name = "gollum-lib".freeze
  s.version = "5.2.4"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Tom Preston-Werner".freeze, "Rick Olson".freeze]
  s.date = "2023-03-22"
  s.description = "A simple, Git-powered wiki with a sweet API and local frontend.".freeze
  s.email = "tom@github.com".freeze
  s.extra_rdoc_files = ["README.md".freeze, "LICENSE".freeze]
  s.files = ["LICENSE".freeze, "README.md".freeze]
  s.homepage = "http://github.com/gollum/gollum-lib".freeze
  s.licenses = ["MIT".freeze]
  s.rdoc_options = ["--charset=UTF-8".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 2.4".freeze)
  s.rubygems_version = "3.1.6".freeze
  s.summary = "A simple, Git-powered wiki.".freeze

  s.installed_by_version = "3.1.6" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_runtime_dependency(%q<gollum-rugged_adapter>.freeze, ["~> 2.0"])
    s.add_runtime_dependency(%q<rouge>.freeze, ["~> 3.1"])
    s.add_runtime_dependency(%q<nokogiri>.freeze, ["~> 1.8"])
    s.add_runtime_dependency(%q<loofah>.freeze, ["~> 2.3"])
    s.add_runtime_dependency(%q<github-markup>.freeze, ["~> 4.0"])
    s.add_runtime_dependency(%q<gemojione>.freeze, ["~> 4.1"])
    s.add_runtime_dependency(%q<octicons>.freeze, ["~> 12.0"])
    s.add_runtime_dependency(%q<twitter-text>.freeze, ["= 1.14.7"])
    s.add_development_dependency(%q<org-ruby>.freeze, ["~> 0.9.9"])
    s.add_development_dependency(%q<kramdown>.freeze, ["~> 2.3"])
    s.add_development_dependency(%q<kramdown-parser-gfm>.freeze, ["~> 1.1.0"])
    s.add_development_dependency(%q<RedCloth>.freeze, ["~> 4.2.9"])
    s.add_development_dependency(%q<mocha>.freeze, ["~> 1.11"])
    s.add_development_dependency(%q<shoulda>.freeze, ["~> 4.0"])
    s.add_development_dependency(%q<wikicloth>.freeze, ["~> 0.8.3"])
    s.add_development_dependency(%q<bibtex-ruby>.freeze, ["~> 6.0"])
    s.add_development_dependency(%q<citeproc-ruby>.freeze, ["~> 2.0"])
    s.add_development_dependency(%q<unicode_utils>.freeze, ["~> 1.4.0"])
    s.add_development_dependency(%q<rake>.freeze, ["~> 13.0"])
    s.add_development_dependency(%q<pry>.freeze, ["~> 0.13"])
    s.add_development_dependency(%q<rb-readline>.freeze, ["~> 0.5.1"])
    s.add_development_dependency(%q<test-unit>.freeze, ["~> 3.3"])
    s.add_development_dependency(%q<minitest-reporters>.freeze, ["~> 1.4"])
    s.add_development_dependency(%q<nokogiri-diff>.freeze, ["~> 0.2.0"])
    s.add_development_dependency(%q<guard>.freeze, ["~> 2.16"])
    s.add_development_dependency(%q<guard-minitest>.freeze, ["~> 2.4"])
    s.add_development_dependency(%q<twitter_cldr>.freeze, ["~> 6.4"])
  else
    s.add_dependency(%q<gollum-rugged_adapter>.freeze, ["~> 2.0"])
    s.add_dependency(%q<rouge>.freeze, ["~> 3.1"])
    s.add_dependency(%q<nokogiri>.freeze, ["~> 1.8"])
    s.add_dependency(%q<loofah>.freeze, ["~> 2.3"])
    s.add_dependency(%q<github-markup>.freeze, ["~> 4.0"])
    s.add_dependency(%q<gemojione>.freeze, ["~> 4.1"])
    s.add_dependency(%q<octicons>.freeze, ["~> 12.0"])
    s.add_dependency(%q<twitter-text>.freeze, ["= 1.14.7"])
    s.add_dependency(%q<org-ruby>.freeze, ["~> 0.9.9"])
    s.add_dependency(%q<kramdown>.freeze, ["~> 2.3"])
    s.add_dependency(%q<kramdown-parser-gfm>.freeze, ["~> 1.1.0"])
    s.add_dependency(%q<RedCloth>.freeze, ["~> 4.2.9"])
    s.add_dependency(%q<mocha>.freeze, ["~> 1.11"])
    s.add_dependency(%q<shoulda>.freeze, ["~> 4.0"])
    s.add_dependency(%q<wikicloth>.freeze, ["~> 0.8.3"])
    s.add_dependency(%q<bibtex-ruby>.freeze, ["~> 6.0"])
    s.add_dependency(%q<citeproc-ruby>.freeze, ["~> 2.0"])
    s.add_dependency(%q<unicode_utils>.freeze, ["~> 1.4.0"])
    s.add_dependency(%q<rake>.freeze, ["~> 13.0"])
    s.add_dependency(%q<pry>.freeze, ["~> 0.13"])
    s.add_dependency(%q<rb-readline>.freeze, ["~> 0.5.1"])
    s.add_dependency(%q<test-unit>.freeze, ["~> 3.3"])
    s.add_dependency(%q<minitest-reporters>.freeze, ["~> 1.4"])
    s.add_dependency(%q<nokogiri-diff>.freeze, ["~> 0.2.0"])
    s.add_dependency(%q<guard>.freeze, ["~> 2.16"])
    s.add_dependency(%q<guard-minitest>.freeze, ["~> 2.4"])
    s.add_dependency(%q<twitter_cldr>.freeze, ["~> 6.4"])
  end
end
