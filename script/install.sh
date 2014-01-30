DIR=$(cd $(dirname "$0"); pwd)
path="/etc/tegh"
cert="$path/cert"
set -e

# Warming up the sudo cache
sudo -v

# Groups

sudo groupadd teghadmin | sudo dseditgroup -q -r "Tegh Admin" -o create teghadmin

# Config File and Directories
# ==============================================================================

sudo mkdir -p "$path/3d_printers/by_serial/"
sudo chmod 655 $path
sudo chmod 775 "$path/3d_printers/by_serial"
sudo chown root:teghadmin "$path/3d_printers/by_serial"
sudo cp "$DIR/../defaults/tegh.yml" "$path/tegh.yml"

# PAM
# ==============================================================================

# Copying the sshd settings. Yes this is a massive hack.
# If you have a better way that will work across os's please make the patch!
sudo cp /etc/pam.d/sshd /etc/pam.d/tegh

# SSL Cert
# ==============================================================================

# Generating the SSL Cert
sudo openssl genrsa -des3 -passout pass:x -out "$cert.pass.key" 2048
sudo openssl rsa -passin pass:x -in "$cert.pass.key" -out "$cert.key"
yes "" | sudo openssl req -new -key "$cert.key" -out "$cert.csr"
sudo openssl x509 -req -days 365 -in "$cert.csr" -signkey "$cert.key" -out "$cert.crt"

# Converting to PFX format
sudo openssl pkcs12 -export -password pass: -out "$cert.pfx" -inkey "$cert.key" -in "$cert.crt"

# Clean up
sudo rm $cert.pass.key
sudo rm $cert.key
sudo rm $cert.csr
sudo rm $cert.crt
