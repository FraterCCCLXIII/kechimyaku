# -*- encoding: utf-8 -*-
# stub: json 2.1.0 ruby lib
# stub: ext/json/ext/generator/extconf.rb ext/json/ext/parser/extconf.rb ext/json/extconf.rb

Gem::Specification.new do |s|
  s.name = "json".freeze
  s.version = "2.1.0"

  s.required_rubygems_version = Gem::Requirement.new(">= 0".freeze) if s.respond_to? :required_rubygems_version=
  s.require_paths = ["lib".freeze]
  s.authors = ["Florian Frank".freeze]
  s.date = "2017-04-18"
  s.description = "This is a JSON implementation as a Ruby extension in C.".freeze
  s.email = "flori@ping.de".freeze
  s.extensions = ["ext/json/ext/generator/extconf.rb".freeze, "ext/json/ext/parser/extconf.rb".freeze, "ext/json/extconf.rb".freeze]
  s.extra_rdoc_files = ["README.md".freeze]
  s.files = ["README.md".freeze, "ext/json/ext/generator/extconf.rb".freeze, "ext/json/ext/parser/extconf.rb".freeze, "ext/json/extconf.rb".freeze]
  s.homepage = "http://flori.github.com/json".freeze
  s.licenses = ["Ruby".freeze]
  s.rdoc_options = ["--title".freeze, "JSON implemention for Ruby".freeze, "--main".freeze, "README.md".freeze]
  s.required_ruby_version = Gem::Requirement.new(">= 1.9".freeze)
  s.rubygems_version = "3.1.6".freeze
  s.summary = "JSON Implementation for Ruby".freeze

  s.installed_by_version = "3.1.6" if s.respond_to? :installed_by_version

  if s.respond_to? :specification_version then
    s.specification_version = 4
  end

  if s.respond_to? :add_runtime_dependency then
    s.add_development_dependency(%q<rake>.freeze, [">= 0"])
    s.add_development_dependency(%q<test-unit>.freeze, ["~> 2.0"])
  else
    s.add_dependency(%q<rake>.freeze, [">= 0"])
    s.add_dependency(%q<test-unit>.freeze, ["~> 2.0"])
  end
end
