#!/bin/bash

# ##################################################### #
#
#   This is the build script for lergo.
#
#
#
# it is called `provision` because we use it as part of the vagrant automation for the build.
# we moved to vagrant ever since cloudbees' environment started to break for some unknown reason.
#
#
# see more details on the problem we saw: http://stackoverflow.com/q/26945290/1068746
#
#
#
#
# ##################################################### #

set -e

echo "setting build information"
source /vagrant/build_details.sh

echo "starting provision script"
source /vagrant/prepare_machine.sh

# we need to build ri first since it includes some build crucial files.
echo "running build_lergo_ri"
source /vagrant/build_lergo_ri.sh

echo "running build_lergo_ui"
source /vagrant/build_lergo_ui.sh


echo "getting artifacts"
source /vagrant/get_artifacts.sh
