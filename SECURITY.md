# Credential Security Guide

This short document explains how to keep your OpenSky Network username
and password safe when working with this project.

1. **Use environment variables** – Place `OPENSKY_USERNAME` and
   `OPENSKY_PASSWORD` in a `.env` file or your shell profile.
   The repository's `.gitignore` already excludes `.env` files.
2. **Use GitHub Secrets for CI** – Navigate to *Settings → Secrets*
   and create secrets so automated workflows can access credentials
   without storing them in the repo.
3. **Never log credentials** – Audit your code and build scripts to make
   sure no `console.log()` or debug output contains the username or
   password. Review CI logs as well.

Following these steps helps prevent accidental leaks and keeps your
access to the OpenSky API secure.

