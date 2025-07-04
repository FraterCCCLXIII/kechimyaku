# Install script for directory: /Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/src/libgit2

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/usr/local")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "RelWithDebInfo")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set path to fallback-tool for dependency-resolution.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/bin/objdump")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/pkgconfig" TYPE FILE FILES "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/libgit2.pc")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/cmake/libgit2" TYPE FILE FILES
    "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/cmake/libgit2Config.cmake"
    "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/cmake/libgit2ConfigVersion.cmake"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  if(EXISTS "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib/cmake/libgit2/libgit2Targets.cmake")
    file(DIFFERENT _cmake_export_file_changed FILES
         "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib/cmake/libgit2/libgit2Targets.cmake"
         "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/src/libgit2/CMakeFiles/Export/d8b35670abc54627d3573017ae1f1674/libgit2Targets.cmake")
    if(_cmake_export_file_changed)
      file(GLOB _cmake_old_config_files "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib/cmake/libgit2/libgit2Targets-*.cmake")
      if(_cmake_old_config_files)
        string(REPLACE ";" ", " _cmake_old_config_files_text "${_cmake_old_config_files}")
        message(STATUS "Old export file \"$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib/cmake/libgit2/libgit2Targets.cmake\" will be replaced.  Removing files [${_cmake_old_config_files_text}].")
        unset(_cmake_old_config_files_text)
        file(REMOVE ${_cmake_old_config_files})
      endif()
      unset(_cmake_old_config_files)
    endif()
    unset(_cmake_export_file_changed)
  endif()
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/cmake/libgit2" TYPE FILE FILES "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/src/libgit2/CMakeFiles/Export/d8b35670abc54627d3573017ae1f1674/libgit2Targets.cmake")
  if(CMAKE_INSTALL_CONFIG_NAME MATCHES "^([Rr][Ee][Ll][Ww][Ii][Tt][Hh][Dd][Ee][Bb][Ii][Nn][Ff][Oo])$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib/cmake/libgit2" TYPE FILE FILES "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/src/libgit2/CMakeFiles/Export/d8b35670abc54627d3573017ae1f1674/libgit2Targets-relwithdebinfo.cmake")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib" TYPE STATIC_LIBRARY FILES "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/libgit2.a")
  if(EXISTS "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib/libgit2.a" AND
     NOT IS_SYMLINK "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib/libgit2.a")
    execute_process(COMMAND "/usr/bin/ranlib" "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib/libgit2.a")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/include/git2" TYPE DIRECTORY FILES "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/include/git2/")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/include/git2" TYPE FILE FILES "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/include/git2/experimental.h")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/include" TYPE FILE FILES "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/include/git2.h")
endif()

string(REPLACE ";" "\n" CMAKE_INSTALL_MANIFEST_CONTENT
       "${CMAKE_INSTALL_MANIFEST_FILES}")
if(CMAKE_INSTALL_LOCAL_ONLY)
  file(WRITE "/Users/paulbloch/Kechimyaku/kechimyaku/vendor/bundle/ruby/2.7.0/gems/rugged-1.9.0/vendor/libgit2/build/src/libgit2/install_local_manifest.txt"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
endif()
