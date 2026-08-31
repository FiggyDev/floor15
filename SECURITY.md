# Security Policy

## Reporting a vulnerability (privately, please)

Use **GitHub private vulnerability reporting** on this repository (Security →
"Report a vulnerability"). If that is unavailable, open an issue that says only
"security — requesting private contact" with NO details, and a maintainer will
respond with a private channel.

**Never post exploit details publicly first.** Give us a reasonable window to
fix before disclosure. We'll credit reporters in release notes unless you'd
rather stay anonymous.

In scope: the site, the engine, the export pipeline, the safety layer (a way to
sneak forbidden content past Linda IS a security bug — she wants to hear it),
CI/build tooling, and anything that could make this repo lie to its readers.

## Report scams and impersonation

Also report — privately or via a public issue if it's already public:
- **fake contract addresses** claiming to be FLOOR 15
- impersonation accounts, lookalike repos or sites, fake "team members"
- scam links using our name, screenshots of doctored repo files
- suspected compromise of this repository or its maintainer accounts

## The address rule (the part that protects people)

The ONLY official contract address source is
[`docs/contracts/ADDRESSES.md`](docs/contracts/ADDRESSES.md) **on the default
branch, after a verified deploy and a signed release**. Replies, DMs, admins,
screenshots, QR codes, and urgent-sounding posts are never official. Urgency is
the tell.

**While that file says NOT DEPLOYED — as it does today — every claimed FLOOR 15
contract address is fake.** Report it; don't send to it.

## Bug bounty

There is no bug bounty program. None is promised. If one is ever announced, it
will be announced here and in a signed release — not in your DMs.

*Filed by Linda Legal. Approved on the first pass, which everyone found unsettling.*
