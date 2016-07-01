#! /bin/bash


# when pointing cron to this file, omit the extension.
# /etc/cron.hourly/backup_db --> .../lergo-ri/build/backup_db.sh
# otherwise cron will silently ignore

# the shebang (! /bin/sh ) is also crucial for cron. don't remove it.


set -e


cd /dev/lergo_data/backups

# eval "`wget --no-cache --no-check-certificate -O - http://get.gsdev.info/gsat/1.0.0/install_gsat.sh | dos2unix `"
# SYSCONFIG_FILE=lergo read_sysconfig

source /etc/sysconfig/lergo

if [ "$S3_BACKUP_PATH_YEARLY" = "" ]; then
    echo "missing S3_BACKUP_PATH"
    exit 1
fi

if [ ! -f /usr/local/bin/pip ]; then
    echo "installing pip"
    wget "https://bootstrap.pypa.io/get-pip.py" -O get-pip.py
    python get-pip.py
else
    echo "pip already installed"

fi

if [ ! -f /usr/bin/aws ]; then
    echo "installing aws cli"
    pip install awscli
else
    echo "aws cli already installed"
fi


echo creating backup
file_timestamp=`date +%Y%m%d_%H%M%S_%N`
dump_filename="dump_${file_timestamp}.tar.gz"
mongodump
tar -czvf $dump_filename dump
rm -Rf dump

if [ ! -z "$DB_BACKUP_ENCRYPT_KEY" ]; then
    # encrypt the file if enncryption key is specified
    openssl aes-256-cbc -a -salt -in $dump_filename -out $dump_filename.enc -pass  pass:$DB_BACKUP_ENCRYPT_KEY

    # decrypt this file with "openssl aes-256-cbc -d -a -in secrets.txt.enc -out secrets.txt.new -pass pass:password"
    # see more at: "http://tombuntu.com/index.php/2007/12/12/simple-file-encryption-with-openssl/"
    # http://stackoverflow.com/questions/8641109/encrypt-a-file-using-bash-shell-script

    rm -rf $dump_filename
    mv ${dump_filename}.enc $dump_filename
fi

aws s3 cp $dump_filename $S3_BACKUP_PATH_YEARLY --profile lergo
sleep 20
rm -Rf $dump_filename

echo "file will be available in s3 as long as the lifecycle defined in amazon allows it"
