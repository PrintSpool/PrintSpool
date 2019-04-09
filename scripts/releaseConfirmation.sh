#!/bin/bash
set -e

echo "Are you sure you want to release a new Beta for Tegh?"
select yn in "Yes" "No"; do
    case $yn in
        Yes ) exit 0;;
        No ) exit 1;;
    esac
done
