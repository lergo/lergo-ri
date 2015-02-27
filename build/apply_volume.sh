#!/bin/bash
# This script demonstrates the steps required
# to use a volume in amazon


echo "this script is not for running.."
exit 1

# instructions can be found at: http://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ebs-using-volumes.html


# use the `lsblk` command to find device name
export DEVICE_NAME=


# run command `sudo file -s /dev/xvdf` to find if you need to initialize volume or not
# if response says only 'data' - you do need
# if you need to initialize, run command `sudo mkfs -t ext4 $DEVICE_NAME`

echo "mounting volume"

export MOUNT_POINT=

sudo mkdir $MOUNT_POINT
sudo mount $DEVICE_NAME $MOUNT_POINT


echo "configure auto mount"
sudo cp /etc/fstab /etc/fstab.orig
sudo -E bash -c 'echo "$DEVICE_NAME $MOUNT_POINT ext4    defaults,nofail        0       2" >>  /etc/fstab'

# to test auto configuration works well run `sudo mount -a`
# if something went wrong, run `sudo mv /etc/fstab.orig /etc/fstab`


## now you can use the new disk as mongo db-data
## sudo service mongodb stop
## sudo mv /var/lib/mongodb /var/lib/backup_mongodb ## only if need to.. you can also remove it
## sudo ln -Tfs /dev/lergo_data/mongo /var/lib/mongodb
## sudo chown mongnodb:mongodb -R /dev/lergo_data/mongo ## you might need this
## sudo service mongodb start