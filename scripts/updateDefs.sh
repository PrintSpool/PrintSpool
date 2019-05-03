#!/usr/bin/env bash
BASEDIR=$(realpath $(dirname "$0"))

cd "$BASEDIR"
mkdir -p ../defs/sources
cd ../defs/sources

# git -C ultimaker-cura pull || git clone https://github.com/Ultimaker/Cura.git ultimaker-cura
# git -C lulzbot-cura pull || git clone https://code.alephobjects.com/source/cura-lulzbot.git lulzbot-cura

for fA in ./ultimaker-cura/*; do
    fB=./lulzbot-cura/${f##*/}
    [[ -f $fA && -f $fB ]] && echo "DUPLICATE DEFS: $fA and $fB"
done

mkdir -p ../staging
rm -rf ../staging/**/*
mkdir -p ../staging/machines

array=( definitions extruders gcodes images meshes )
for i in "${array[@]}"
do
   [ -d "./ultimaker-cura/resources/${i}" ] && rsync -a ./ultimaker-cura/resources/${i} ../staging/
   [ -d "./lulzbot-cura/resources/${i}" ] && rsync -a ./lulzbot-cura/resources/${i} ../staging/
done

# rsync ./ultimaker-cura/resources/definitions/* ../staging/machines/
# rsync ./lulzbot-cura/resources/definitions/* ../staging/machines/

cd "$BASEDIR"
node ./createDefIndex.js
