# Security Policy

## Reporting a vulnerability

Please report suspected security issues privately through GitHub by opening a security advisory or contacting the repository maintainer directly.

## Scope

This repository contains public prompt archives and documentation. The main risks are content integrity, misleading attribution, and accidental exposure of sensitive data.

## Expectations

- Do not open public issues for vulnerabilities before they are triaged.
- Provide enough detail to reproduce the issue.
- Avoid exfiltrating or sharing private data.

## Repository protections

The repository now includes:
- GitHub Actions-based static analysis with CodeQL
- secret scanning on pushes and pull requests
- dependency update monitoring with Dependabot
- contribution and review templates to reduce risky changes
