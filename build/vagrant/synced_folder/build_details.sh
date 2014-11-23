# using this file to transfer build details
# the variables mentioned here are inspired by jenkins
# the defaults values you see while reading it are used when running build manually.
# when the build runs from jenkins this file is overridden.

MILLISECONDS=`date +%s%N | cut -b1-13`
HOSTNAME=`hostname`

export BUILD_NUMBER="$MILLISECONDS"
export BUILD_ID="$HOSTNAME_$MILLISECONDS"
export BUILD_DISPLAY_NAME="$BUILD_ID"
export JOB_NAME="build-lergo-manually"
export BUILD_TAG="$BUILD_ID"
