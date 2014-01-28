path="/etc/tegh"
baseName="$path/cert"

# Warming up the sudo cache
sudo -v

# Creating the directory
sudo mkdir -p "$path/"
sudo chmod 655 $path

# Generating the SSL Cert
sudo openssl genrsa -des3 -passout pass:x -out "$baseName.pass.key" 2048
sudo openssl rsa -passin pass:x -in "$baseName.pass.key" -out "$baseName.key"
yes "" | sudo openssl req -new -key "$baseName.key" -out "$baseName.csr"
sudo openssl x509 -req -days 365 -in "$baseName.csr" -signkey "$baseName.key" -out "$baseName.crt"

# Converting to PFX format
sudo openssl pkcs12 -export -password pass: -out "$baseName.pfx" -inkey "$baseName.key" -in "$baseName.crt"

# Clean up
sudo rm $baseName.pass.key
sudo rm $baseName.key
sudo rm $baseName.csr
sudo rm $baseName.crt
