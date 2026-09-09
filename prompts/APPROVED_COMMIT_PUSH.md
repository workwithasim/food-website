# Commit/Push Prompt After User Approval

The user has explicitly approved committing/pushing the completed phase.

Before committing:
1. Run `git status`.
2. Confirm only intended phase changes are present.
3. Run `git diff --check`.
4. Confirm required tests still pass or were run successfully after final edits.
5. Never stage secrets.

Then:
```bash
git add <only intended files>
git commit -m "<approved conventional commit>"
git push -u origin <approved phase branch>
```

Repository:
`https://github.com/workwithasim/food-website.git`

Report:
- commit hash
- branch
- push result
- any GitHub PR URL if one was created by available tooling

Do not start the next phase unless the user has instructed you to continue.
