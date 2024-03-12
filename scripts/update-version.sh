#!/usr/bin/env bash

VERSION=${1:-patch}

run_npm_version() {
  npm version "$1" --no-git-tag-version || exit 1
}

# Check if the version is major, minor or patch
if [[ $VERSION =~ ^(major|minor|patch)$ ]]; then
  true
# Check if the version is in format 0-9
elif [[ $VERSION =~ ^[0-9]+$ ]]; then
  VERSION="$VERSION.0.0"
# Check if the version is in format 0-9.0-9
elif [[ $VERSION =~ ^[0-9]+\.[0-9]+$ ]]; then
  VERSION="$VERSION.0"
# Check if the version is in format 0-9.0-9.0-9
elif [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  true
else
  echo "Invalid version format."
  echo "  major|minor|patch"
  echo "  x|x.x|x.x.x (e.g. 1, 1.1 or 1.0.1)"
  echo "  defaults to patch"
  exit 128
fi

run_npm_version "$VERSION"
