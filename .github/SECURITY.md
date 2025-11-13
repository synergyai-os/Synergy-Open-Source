# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < main  | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: security@synergyos.ai
2. **GitHub Security Advisory**: Use the "Report a vulnerability" button on the [Security tab](https://github.com/synergyai-os/Synergy-Open-Source/security) of this repository

### What to Include

When reporting a vulnerability, please include:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- The location of the affected code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity and complexity

### Severity Levels

We use the following severity levels:

- **Critical**: Remote code execution, authentication bypass, data breach
- **High**: Privilege escalation, sensitive data exposure
- **Medium**: Information disclosure, CSRF, XSS
- **Low**: Minor information leaks, security misconfigurations

### Disclosure Policy

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide regular updates on the status of the vulnerability
- We will notify you when the vulnerability is fixed
- We will credit you in the security advisory (unless you prefer to remain anonymous)

### Safe Harbor

We support responsible disclosure. Any activities conducted in a manner consistent with this policy will be considered authorized conduct and we will not pursue legal action against you. If you have any concerns or questions, please contact us at security@synergyos.ai.

## Security Best Practices

### For Contributors

- Never commit secrets, API keys, or credentials
- Use environment variables for sensitive configuration
- Review dependencies regularly for known vulnerabilities
- Follow secure coding practices (see `CONTRIBUTING.md`)
- Keep dependencies up to date

### For Users

- Keep your installation up to date
- Use strong, unique passwords
- Enable two-factor authentication where available
- Review and audit your environment variables regularly
- Monitor for security advisories

## Security Features

- **Dependabot**: Automated dependency updates and vulnerability scanning
- **Code Scanning**: Automated code analysis for security issues
- **Secret Scanning**: Detection of accidentally committed secrets
- **Branch Protection**: Required reviews and status checks for main branch

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
