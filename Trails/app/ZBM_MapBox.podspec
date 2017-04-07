Pod::Spec.new do |s|

  s.name         = "ZBM_MapBox"
  s.version      = "1.0"
  s.summary      = "Zadar bike magic extensions"

  s.description  = "insert description here"

  s.homepage     = "http://www.shoutem.com"
  s.platform     = :ios

  s.license      = { :type => "MIT" }

  s.author       = { "Slavko Štimac" => "slavko@shoutem.com" }

  s.source       = { :path => "" }

  s.exclude_files = "Classes/Exclude"

  # s.public_header_files = "Classes/**/*.h"

  s.dependency  'Mapbox-iOS-SDK'

end