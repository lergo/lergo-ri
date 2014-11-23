set -e


wget -O my-vagrant.tgz "https://www.dropbox.com/s/hqs5kkw25qzzjew/my-vagrant.tgz?dl=1"
tar -xzvf my-vagrant.tgz

VAGRANT_CMD="`pwd`/my-vagrant/bin/vagrant"
$VAGRANT_CMD --version

$VAGRANT_CMD plugin install vagrant-aws


echo "cloning vagrant automations"
git clone https://github.com/guy-mograbi-at-gigaspaces/vagrant-automation-machines.git

echo "copying vagrant files from lergo-ri under automations project"
cp -rf lergo-ri/build/vagrant/* vagrant-automation-machines

echo "populating build_details.sh with information from jenkins"

BUILD_DETAILS="vagrant-automation-machines/synced_folder/build_details.sh"
echo "" > $BUILD_DETAILS
echo "BUILDER_NUMBER=\"$BUILD_NUMBER\""
echo "BUILD_ID=\"$BUILD_ID\""
echo "BUILD_DISPLAY_NAME=\"$BUILD_DISPLAY_NAME\""
echo "JOB_NAME=\"$JOB_NAME\""
echo "BUILD_TAG=\"$BUILD_TAG\""


echo "decrypting vagrant config json"
cd lergo-ri
source build/build_decrypt_vagrant_build_config.sh
cd ..


echo "running vagrant up"
cd vagrant-automation-machines
cd aws
export CONFIG_FILE="$VAGRANT_BUILD_CONF"

echo "destroying old machine in case one was left"
$VAGRANT_CMD destroy -f || echo "machine was not up"

$VAGRANT_CMD up --provider aws

echo "destroying the vagrant machine"
$VAGRANT_CMD destroy -f

