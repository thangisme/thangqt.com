---
title: Git push unexpectedly freezes my system
date: 2024-09-24
draft: true
---

Yesterday, I was doing a minor update to my website. When it's time to push the update, I ran into a problem where my laptop completely froze when I ran `git push`.
I was confused and waited for a bit; Nothing happened. My laptop wasn't getting hot, the fan wasn't spinning, I couldn't even switch tty to atleast kill the process.
Still, I was running a couple program at the time, so I thought to myself it've must been other program causing the freese. Didn't think twice, I went ahead and force shut down
my laptop. When it booted up, I promptly opened the terminal and did a `git push` again. My laptop froze, again ...

That was really weird. I tried searching for similar problem but not a single one turned up. Again, I forced shutdown and booted it up. This time, I searched for error log in `journalctl`.
There was none, except some unrelated errors from `gdm` and `swaync`. However, just to make sure those are not interfering with git, I switched to a console tty and `git push` again.

To my surprise, it said something along the line of

```bash
Couldn't read response from /nix/store/.../x11-ssh-askpass
```

then promptly asked for my credential.
"Aha! It must have been cause by that askpass thingy" - I said to myself. It indeed was, as I naively switched back to normal working tty and run that askpass binary. It did caused the freeze again.
There goes another forced shut down...

There weren't much information on `x11-ssh-askpass` that I could find. I looked into the containing folder of the binary. There was another binary named `ssh-askpass`.
I was running Wayland so it's reasonable to think that the x11 version is the cause. Thus, I ran `ssh-askpass` to check. Nope, It f\*cking caused the freeze again.
Desperately, I tried looking for `ssh-askpass wayland` on Google. There were a few relevant results, with the top one point to this [post](https://unix.stackexchange.com/questions/779264/how-do-i-get-ssh-askpass-working-in-wayland-on-kde).
The only answer suggested using `ksshaskpass` which I later knew that It was a alternative to `ssh-askpass` implemented for KWallet.

I'm a fan of KDE. However, I recently made the move to tiling wm and KDE apps need a lot of KDE dependencies; So I was using GDM and Gnome-keyring instead.
I then went ahead and looked for (Gnome) alternative to `ssh-askpass`. As guessed, `gnome-keyring` did have support for git authentication [[source](https://stackoverflow.com/questions/13385690/how-to-use-git-with-gnome-keyring-integration)].
On newer git version, It called `libsecret` and apparently it has to be manually compiled, atleast on major distro.
Naturally, I search for `git-credential-libsecret nixos`, after a bit, I found the official [Nix wiki on this](https://wiki.nixos.org/wiki/Git). Below is what the wiki suggested:

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

I dig a little deeper on Google and finally found the [related offical Git docs](https://git-scm.com/docs/gitcredentials). As suggested on the page, I ran below command to list available auth helper:

```bash
git help -a | grep credential-
```

The `libsecret` helper didn't show up. It baffled me that the official solution by the Nix wiki didn't work.
Looking for other search results, I came into [this thread](https://discourse.nixos.org/t/git-credential-manager-on-nixos/25742/4) on NixOS forum.
[This answer](https://discourse.nixos.org/t/git-credential-manager-on-nixos/25742/6) suggested that the official solution was outdated. So in the end, I tried the config the answer gave

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

After deploying, I ran above mentioned command to list available helper again.
There was it - `credential-libsecret`. Hopping for this to work, I ran `git push`.

No, I didn't.

Back to the git docs, there was this:

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
