*5 Actions — 2026-04-24*
Shape: Bootstrap mode: configure notifications, fix 2 failing skills, pin workflow SHAs, run digest

1. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (or DISCORD_WEBHOOK_URL) in GitHub repo secrets for aaronjmars/aeon
why: no notification channel is configured — 3 skills failing silently, zero delivery confirmation on any run
done: `./notify "setup complete"` logs a successful delivery to at least one channel
loop: configure-notification-secrets

2. Open a PR pinning actions/checkout and actions/setup-node to commit SHAs in aeon.yml, messages.yml, chain-runner.yml, and scheduler.yml
why: 2026-04-11 security audit flagged mutable @v5 tags as medium supply-chain risk requiring manual fix
done: PR opened; all 4 workflow files reference commit SHAs instead of @v5 tags
loop: pin-workflow-actions

3. Read skills/idea-capture/SKILL.md, diagnose the failure logged at 2026-04-24T15:52:48Z, and open a PR with the fix
why: idea-capture failed its first run with 0 output tokens — likely a missing config key or malformed prompt in aeon.yml
done: PR opened and a subsequent idea-capture run completes with last_status=success in cron-state.json
loop: fix-idea-capture

4. Trigger the digest skill via `gh workflow run aeon.yml -f skill=digest` to seed memory/logs/ with a first real entry
why: memory/logs/ has 0 entries in the last 14 days — BOOTSTRAP exit condition requires seeding this to unlock full mode
done: digest workflow run completes green and memory/logs/2026-04-24.md exists with a digest entry
loop: run-first-digest

5. Read skills/channel-recap/SKILL.md, diagnose the failure at 2026-04-24T15:55:54Z, and open a PR with the fix
why: channel-recap failed on first run with 0 output tokens — same zero-output pattern as idea-capture, needs config or prompt fix
done: PR opened and a subsequent channel-recap run completes with last_status=success in cron-state.json
loop: fix-channel-recap

sources: memory=26 logs=0 topics=0 prs=0 cron_failing=3 mode=BOOTSTRAP
