#!/bin/bash
set -e

# ARCH will be auto-detected as the host if not specified
#ARCH=i486
#ARCH=x86_64
#ARCH=powerpc
ARCH=arm
#ARCH=microblaze
#ARCH=mips
#ARCH=mipsel

CC_BASE_PREFIX=/opt/cross

# If you use arm, you may need more fine-tuning:
# arm hardfloat v7
TRIPLE=arm-linux-musleabihf
GCC_BOOTSTRAP_CONFFLAGS="--with-arch=armv7-a --with-float=hard --with-fpu=vfpv3-d16"
GCC_CONFFLAGS="--with-arch=armv7-a --with-float=hard --with-fpu=vfpv3-d16"

# arm softfp
#TRIPLE=arm-linux-musleabi
#GCC_BOOTSTRAP_CONFFLAGS="--with-arch=armv7-a --with-float=softfp"
#GCC_CONFFLAGS="--with-arch=armv7-a --with-float=softfp"

MAKEFLAGS=-j8

# Enable this to build the bootstrap gcc (thrown away) without optimization, to reduce build time
# GCC_STAGE1_NOOPT=1

# GCC_BUILTIN_PREREQS=yes

cd ./packages/${PACKAGE}

# CC=arm-linux-gnueabihf-gcc

cargo build --release --bins --target=armv7-unknown-linux-gnueabihf

RUST_RELEASE_DIR=./target/armv7-unknown-linux-gnueabihf/release
SNAP_BIN_DIR=../../snap/${PACKAGE}-bin/armv7/

find ${RUST_RELEASE_DIR} -maxdepth 1 -type f \( ! -iname ".*" ! -iname "*.d" \) -exec cp -t ${SNAP_BIN_DIR} {} +

