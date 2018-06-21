#!/bin/sh

set -e

scripts/test-compat.sh "2.0.8"
scripts/test-compat.sh "2.1.10"
scripts/test-compat.sh "2.2.6"
scripts/test-compat.sh "2.3.4"
scripts/test-compat.sh "2.4.2"
scripts/test-compat.sh "2.5.13"