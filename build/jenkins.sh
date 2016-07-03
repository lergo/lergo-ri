set -e
VAGRANT_CMD="`pwd`/my-vagrant/opt/vagrant/bin/vagrant"
SHOULD_INSTALL_VAGRANT=false

if [ ! -f "$VAGRANT_CMD" ]; then
    SHOULD_INSTALL_VAGRANT=true
fi

if [ "$SHOULD_INSTALL_VAGRANT" = "true" ];then
    rm -rf my-vagrant my-vagrant.tgz || echo "nothing to delete"
    wget -O my-vagrant.tgz "https://www.dropbox.com/s/ug875tzvtfg9dlf/my-vagrant.tar.gz?dl=1"
    tar -xzvf my-vagrant.tgz
    $VAGRANT_CMD --version

else
    echo "assuming vagrant already installed on the system"
fi


$VAGRANT_CMD plugin uninstall vagrant-aws || echo "plugin was not installed"
$VAGRANT_CMD plugin install vagrant-aws


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

BUILD_FAILED=0
$VAGRANT_CMD up --provider aws ||  BUILD_FAILED=1

echo "destroying the vagrant machine"
$VAGRANT_CMD destroy -f

echo "status code $BUILD_FAILED"

if [ "$BUILD_FAILED" = "1" ];then
   echo "build failed"
   return 1
fi


