# Review Phase Prompt

Review the currently completed phase as if you were a senior engineer who did not write it.

Check:
- PRD/TRD compliance
- tenant isolation
- branch authorization
- schema correctness
- money/order/payment invariants
- security
- error states
- tests
- regressions
- documentation
- unrelated changes

Run the required verification commands.

Do not commit/push.

If issues exist, fix them and rerun checks. When everything passes, produce the standard phase completion report and ask for commit/push approval.
