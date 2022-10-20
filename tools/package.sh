#!/bin/bash

set -e

yarn install
for i in plugins/*; do
   echo "\nPackaging $i"
   PACKAGER="$i/package.sh"
   if [ -x "$PACKAGER" ]; then
     echo "Package script $PACKAGER exists, running it"
     $PACKAGER
   else
     echo "Package script $PACKAGER not found, copying from $i to dist/plugins"
     cp -R $i dist/plugins
   fi
done
