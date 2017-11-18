echo "cd /vagrant/packages/tegh-daemon" >> /home/ubuntu/.bashrc
echo "**************************************************"
echo "INSTALLING NVM"
echo "**************************************************"
curl -sS -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
echo "source /home/ubuntu/.nvm/nvm.sh" >> /home/ubuntu/.profile
source /home/ubuntu/.profile
echo "**************************************************"
echo "INSTALLING NVM [DONE]"
echo "**************************************************"

nvm install v9.2.0
nvm alias default v9.2.0
npm i -g yarn
cd /vagrant/packages/tegh-daemon
yarn
