#!/bin/bash

set -e

TARGET=./dist/plugins/burns-audio

mkdir -p $TARGET
cp -R ./node_modules/burns-audio-wam/dist/plugins/* $TARGET
