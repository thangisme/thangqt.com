---
title: Sleep and hibernate issues on Void Linux
date: 2024-11-24
tags: 
  - void
  - linux
---

If you're having issue with system not waking up from sleep or hibernate, check your kernel version. The current Void kernel version is 6.6 which is causing the issue.
Upgrading to at least 6.7 (in my case is 6.9) should fix it.

Source: [Linux kernel 6.5, 6.6: System not waking up from standby / suspend.](https://github.com/void-linux/void-packages/issues/46427)
