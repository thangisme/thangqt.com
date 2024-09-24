---
title: Git push unexpectedly freezes my system
date: 2024-09-24
tags: 
  - linux
  - nixos
  - troubleshooting
---

*Disclaimer: This blog post has been rewritten with the assistance of AI to improve clarity and readability.
If you wish to read the original version, you can find it [here](https://github.com/thangisme/thangqt.com/blob/8b8e663cf1aca1cac083ad6d3ba0bd8767e7539a/content/notes/nixos/git_push_freeze_system.md)*

Yesterday, while making a small update to my website, I encountered an unusual problem: my laptop completely froze when I ran `git push`. At first, I waited, hoping it would resolve itself—no luck. My laptop wasn't overheating, the fan wasn't running, and I couldn't even switch to another tty to kill the process.

Thinking that another running program might have been the culprit, I forced a shutdown and rebooted. I opened the terminal again and ran `git push`—the system froze once more.

At this point, I knew something was off. A quick online search didn’t reveal any similar issues. After another forced shutdown, I decided to check the system logs using `journalctl`, but there was nothing relevant except for some unrelated errors from `gdm` and `swaync`. Just to be sure, I switched to a console tty and tried `git push` there.

To my surprise, the terminal displayed an error about being unable to read a response from `/nix/store/.../x11-ssh-askpass`, followed by a prompt for my credentials.

“Aha! This must be related to that askpass thing,” I thought. I naively switched back to the graphical session and ran the askpass binary manually. Sure enough, the system froze again. After yet another forced shutdown, I began digging deeper into the problem.

I couldn’t find much information about `x11-ssh-askpass`. Curious, I checked its folder and noticed another binary named `ssh-askpass`. Since I was using Wayland, I figured the x11 version could be causing the issue. So, I ran `ssh-askpass`, only to face another freeze.

Feeling stuck, I searched for `ssh-askpass wayland` and stumbled upon a relevant [StackExchange post](https://unix.stackexchange.com/questions/779264/how-do-i-get-ssh-askpass-working-in-wayland-on-kde). The top answer suggested using `ksshaskpass`, a KDE alternative to `ssh-askpass` integrated with KWallet.

As much as I like KDE, I had recently switched to a tiling window manager, so I wasn’t using KDE apps to avoid their large dependencies. Instead, I was relying on GDM and Gnome-keyring. I then searched for a Gnome-based alternative to `ssh-askpass`, and found out that `gnome-keyring` supports Git authentication [[source](https://stackoverflow.com/questions/13385690/how-to-use-git-with-gnome-keyring-integration)].

On newer Git versions, the authentication method uses `libsecret`, which needs to be manually compiled in some distributions. Naturally, I searched for `git-credential-libsecret` on NixOS and found the [NixOS wiki](https://wiki.nixos.org/wiki/Git). The recommended configuration was as follows:

```nix
{ pkgs, ... }:

{
  programs.git = {
    enable = true;
    extraConfig = {
      credential.helper = "${
          pkgs.git.override { withLibsecret = true; }
        }/bin/git-credential-libsecret";
    };
  };
}
```

Needless to say, I was excited and ready to take a break. It saddened me to see my laptop hang again after deploying the fix. I was feeling impatiently already.

Feeling frustrated, I dug deeper and found the [official Git documentation](https://git-scm.com/docs/gitcredentials). As suggested there, I listed the available credential helpers by running:

```bash
git help -a | grep credential-
```

Oddly, the `libsecret` helper didn’t show up. Confused, I continued searching and came across a [NixOS forum thread](https://discourse.nixos.org/t/git-credential-manager-on-nixos/25742/4). One user mentioned that the official solution in the wiki was outdated. They provided this alternative configuration:

```nix
{ pkgs, ... }:
{
  programs.git = {
    enable = true;
    package = pkgs.gitFull;
    extraConfig = {
      credential.helper = "libsecret";
    };
  };
}
```

After trying this configuration, I reran the command to list the helpers, and there it was—`credential-libsecret`. I was optimistic this would finally fix the issue.

But no, the system froze again.

At this point, I reread the Git docs more closely and found this section:

```
Without any credential helpers defined, Git will try the following strategies to ask the user for usernames and passwords:

  If the GIT_ASKPASS environment variable is set, the program specified by the variable is invoked. A suitable prompt is provided to the program on the command line, and the user’s input is read from its standard output.

  Otherwise, if the core.askPass configuration variable is set, its value is used as above.

  Otherwise, if the SSH_ASKPASS environment variable is set, its value is used as above.

  Otherwise, the user is prompted on the terminal.
```

I did have the helper installed and correctly defined in config. \*ammm it, git!
In another desperate attempt, I checked for `GIT_ASKPASS` env. It wasn't set.
However, `SSH_ASKPASS` env was indeed set and pointed to the `x11-ssh-askpass` binary at the beginning.
I searched for the env in my NixOS config, there was not. It must've been set either by Git or NixOS.
If I unset the env and do `git push` then it promptly ask for my credential.

Anyway, I didn't care at that point. It shouldn't have asked for my credential in the beginning.
I mistakely cloned the https remote; So I changed the remote to the ssh one, pushed the update and called it a day.
