# tested on ami : ami-7747d01e
set -e
source "/etc/ENVIRONMENT_VARIABLES.sh" || echo "no environment variables"
if [ "$DEBUG_SCRIPT" = "true" ];then
    set -v
    set -x
fi

# prerequisites to install on jenkins before each build

echo "testing if xvfb exists"
XVFB=`which Xvfb` || echo "xvfb does not exist"

if [ "$XVFB" = "" ]; then

    set +e
    echo "updating apt-get repositories"
    sudo apt-get update -y 2> /dev/null
    sudo apt-get install python-software-properties -y 2> /dev/null
    sudo apt-add-repository ppa:brightbox/ruby-ng -y 2> /dev/null
    sudo apt-get update -y 2> /dev/null
    set -e

    # allow the above to fail, but not the below

    echo "installing xvfb"
    sudo apt-get -y install xvfb x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps x11-utils
else
    echo "xvfb already installed.. skipping installation"
fi



export DISPLAY=:1
FREE=`xdpyinfo -display :1 >/dev/null 2>&1 && echo "In use" || echo "Free"`
if [ "$FREE" = "Free" ]; then
    echo "running xvfb on 1"
    Xvfb :1 &
else
    echo "seems that xvfb is already running... skipping execution..."
fi

#
# Fetch node, grunt, bower, npm deps, ruby for compass...
#

#cd $1

## we still use cloudbees' script for installing node.
NODE_EXISTS=`which node` || echo "node does not exist"

if [ "$NODE_EXISTS" = "" ];then

    echo "installing node"
    NVM_HOME=/home/ubuntu/.nvm

    rm -rf $NVM_HOME || echo "nvm folder does not exist. lets continue"

     wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.18.0/install.sh | bash || echo
     source ~/.nvm/nvm.sh
     nvm install 0.10.25 && nvm use 0.10.25

    # ( which node && echo "node already installed..." ) || ( echo "installing nodejs-legacy..." && sudo apt-get install -y nodejs-legacy &&  echo "nodejs installed successfully..." )
    # ( which npm && echo "npm already installed..." ) || ( echo "installing npm ... " && sudo apt-get install -y npm && echo "npm installed successfully..." )


    NODE_EXISTS=`which node`  || echo "node does not exist yet!"
    if [ "$NODE_EXISTS" = "" ];then
        echo "node installation failed.."
        exit 1
    else
        echo "node installation was a success. lets continue"
    fi

else
    echo "node already installed. skipping installation..."
fi


GIT_EXISTS=`which git` || echo "git does not exist"
if [ "$GIT_EXISTS" = "" ];then
    echo "installing git"
    sudo apt-get install git -y

    GIT_EXISTS=`which git` || echo "git does not exist yet!"

    if [ "$GIT_EXISTS" = "" ];then
        echo "git installation failed"
        exit 1
    else
        echo "git installation success. lets continue"
    fi

else
    echo "git already installed"
fi
echo "finished preparing machine"




#RUBY_EXISTS=`which irb`   || echo "ruby does not exist"
#if [ "$RUBY_EXISTS" = "" ];then
#    echo "ruby does not exist. installing..."
#    sudo apt-get install ruby1.8 -y
#    RUBY_EXISTS=`which irb` || echo "ruby does not exist yet!"
#    if [ "$RUBY_EXISTS" = "" ];then
#       echo "ruby installation failed."
#        exit 1
#   else
#        echo "ruby installation success. lets continue"
#    fi
#
#else
#    echo "ruby already installed. skipping..."
#fi
#
#
#GEM_EXISTS=`which gem`  || echo "gem does not exist"
#if [ "$GEM_EXISTS" = "" ];then
#   echo "gem does not exist. installing..."
#   sudo apt-get install rubygems1.8 -y
#    GEM_EXISTS=`which gem` || echo "gem does not exist yet!"
#    if [ "$GEM_EXISTS" = "" ]; then
#       echo "gem installation failed!"
#        exit 1
#    else
#        echo "gem installation success. lets continue"
#    fi
#else
#    echo "gem already installed. skipping... "
#fi

#COMPASS_EXISTS=`which compass` || echo "compass does not exist"
#if [ "$COMPASS_EXISTS" = "" ];then
#    echo "compass does not exist. installing..."
#    sudo gem install --no-ri --no-rdoc --conservative compass
#    COMPASS_EXISTS=`which compass` || echo "compass still does not exist!"
#    if [ "$COMPASS_EXISTS" = "" ]; then
#        echo "compass installation failed!"
#        exit 1
#    else
#        echo "compass installation success. lets continue"
#    fi
#else
#    echo "compass already installed. skipping... "
#fi


CHROME_EXISTS=`which google-chrome` || echo "chrome does not exist"
if [ "$CHROME_EXISTS" = "" ];then
    echo "installing chrome"
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
    sudo sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list'
    sudo apt-get update -y
    sudo apt-get install google-chrome-stable   -y

    CHROME_EXISTS=`which google-chrome` || echo "chrome does not exist still!"

    if [ "$CHROME_EXISTS" = "" ];then
        echo "chrome installation failed"
        exit 1
    else
        echo "chrome installation succeeded. lets continue"
    fi

else
    echo "chrome installed. skipping installation..."
fi


## no need for java since we
## ( `which java` && echo "java already installed" ) || ( echo "installing java" && sudo apt-get install default-jdk -y )

export CHROME_BIN=google-chrome


install_bower_cli(  ){
        npm cache clear
        echo "install bower and grunt  cli retry ::: $1"
        npm install -g grunt-cli bower
}

GRUNT_EXISTS=`which grunt` || echo "grunt does not exist"
BOWER_EXISTS=`which bower` || echo "bower does not exist"

if [ "$GRUNT_EXISTS" = "" ] || [ "$BOWER_EXISTS" = "" ];then

    for i in 1 2 3 4 5 6 7 8 9; do install_bower_cli $i && break || sleep 1; done
fi
