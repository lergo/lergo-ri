set -e


if [ ! -f my-vagrant.tgz ];then
    wget -O my-vagrant.tgz "https://www.dropbox.com/s/hqs5kkw25qzzjew/my-vagrant.tgz?dl=1"
    tar -xzvf my-vagrant.tgz
    SHOULD_INSTALL_PLUGIN=true
else
    echo "assuming vagrant already installed on the system"
    SHOULD_INSTALL_PLUGIN=false
fi

VAGRANT_CMD="`pwd`/my-vagrant/bin/vagrant"
$VAGRANT_CMD --version

if [ "$SHOULD_INSTALL_PLUGIN" = "true" ];then
    $VAGRANT_CMD plugin install vagrant-aws
else
    echo "assuming plugin already installed"
fi


echo "cloning vagrant automation machines"
rm -rf vagrant-automation-machines
git clone https://github.com/guy-mograbi-at-gigaspaces/vagrant-automation-machines.git

echo "copying vagrant files from lergo-ri under automations project"
cp -rf lergo-ri/build/vagrant/* vagrant-automation-machines

echo "populating build_details.sh with information from jenkins"

BUILD_DETAILS="vagrant-automation-machines/synced_folder/build_details.sh"
echo "" > $BUILD_DETAILS
echo "export BUILD_NUMBER=\"$BUILD_NUMBER\"" >> $BUILD_DETAILS
echo "export BUILD_ID=\"$BUILD_ID\"" >> $BUILD_DETAILS
echo "export BUILD_DISPLAY_NAME=\"$BUILD_DISPLAY_NAME\"" >> $BUILD_DETAILS
echo "export JOB_NAME=\"$JOB_NAME\"" >> $BUILD_DETAILS
echo "export BUILD_TAG=\"$BUILD_TAG\"" >> $BUILD_DETAILS


echo "decrypting vagrant config json"
cd lergo-ri
set +v
set +x
source build/build_decrypt_vagrant_build_config.sh   &>2 /dev/null

set -v
set -x

source build/build_decrypt_vagrant_pem.sh    &>2 /dev/null

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

