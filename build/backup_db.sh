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

if [ ! -z "$DB_BACKUP_ENCRYPT_KEY" ]; then
    # encrypt the file if enncryption key is specified
    openssl aes-256-cbc -a -salt -in $dump_filename -out $dump_filename.enc -K  $DB_BACKUP_ENCRYPT_KEY

    # decrypt this file with "openssl aes-256-cbc -d -a -in secrets.txt.enc -out secrets.txt.new -K password"
    # see more at: "http://tombuntu.com/index.php/2007/12/12/simple-file-encryption-with-openssl/"

    rm -rf $dump_filename
    mv $dump_filename.enc $dump_filename
fi

aws s3 cp $dump_filename $S3_BACKUP_PATH --profile lergo
rm -Rf $dump_filename

echo "file will be available in s3 as long as the lifecycle defined in amazon allows it"