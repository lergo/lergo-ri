set -e
eval "`wget --no-cache --no-check-certificate -O - http://get.gsdev.info/gsat/1.0.0/install_gsat.sh | dos2unix `"
SYSCONFIG_FILE=lergo read_sysconfig

check_exists $S3_BACKUP_PATH


if [ ! -f /usr/bin/pip ]; then
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
dump_filename="dump_$file_timestamp.tar.gz"
mongodump
tar -czvf $dump_filename dump
rm -Rf dump
aws s3 cp $dump_filename $S3_BACKUP_PATH --profile lergo
rm -Rf $dump_filename

echo "file will be available in s3 as long as the lifecycle defined in amazon allows it"