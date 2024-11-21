---
title: Back to Void Linux
description: My journey back to Void Linux
date: 2024-11-20
tags:
  - void
  - nixos
  - bsd
---

A while ago, I decided to take the plunge and try NixOS. Everyone warned me about the “steep learning curve,” but honestly, the installation and setup weren’t that bad. Switching to NixOS meant writing configs manually, which inspired me to try tiling window managers and experiment with custom setups. After some time, I had a setup I really liked. For the first time, I thought, Hey, maybe I’ll stop distro-hopping! NixOS had everything I loved.

## The Mysterious Case of Missing Storage

Fast forward a few months, I got into a couple of private trackers (shhh), and before I knew it, I’d downloaded a ton of movies and games. Then came the dreaded “low disk space” notification. My laptop has 500GB of storage, and I knew I’d downloaded over 100GB of stuff, but where did the rest go?

I fired up Filelight to investigate, and there it was—the Nix store, sitting smugly, taking over 100GB. Just to rub it in, it was hoarding multiple versions of JetBrains IDEs, each eating up about 5GB. I already had auto garbage collection set up, but it clearly wasn’t doing enough. I manually ran garbage collection, which freed up a whopping… 10GB. Great, but still not enough. Even after deleting all the old generations, there were still two or three versions of the IDEs hanging around like uninvited guests.

Look, I get it. This is how Nix works—it’s by design. But at that moment, all I could think was, Why does it have to eat so much space?! And here’s the thing: I’m not planning to upgrade my SSD anytime soon. Storage is tight, and I needed a distro that didn’t treat disk space like it’s infinite.

## Falling for OpenBSD (and Failing)

One fine day, while scrolling through Reddit, I came across a post on r/unixporn featuring an OpenBSD rice. It was beautiful—minimal, clean, and just perfect. The user was running cwm, OpenBSD’s default window manager. I thought, If I just add a few effects, I can probably make my setup look like this. But then another thought hit me: Why not try OpenBSD?

Now, I’d heard about BSD’s issues with laptop support, but I was feeling adventurous (or reckless, depending on how you see it). Without checking compatibility, I went ahead and installed OpenBSD. What could possibly go wrong? After all, Linux had always worked fine for me.

Well, lesson learned: OpenBSD isn’t Linux. During installation, I found out my laptop didn’t have a working Wi-Fi driver. No problem, I thought—I’ll just use USB tethering. Even that required some tinkering, but I got through it. The tethering speed was painfully slow, but I held on to the hope that everything would magically work after the base system was installed. Spoiler: It didn’t.

After spending hours setting up the system and installing basic software, I finally looked into the Wi-Fi driver issue. That’s when reality hit me—there was no driver for my laptop. None. Nada. At midnight, exhausted and defeated, I called it quits.

## Crawling Back to Linux

Back to Linux it was. I initially planned to stick with NixOS, but the whole storage situation left a bad taste in my mouth. Between its space-hungry nature and the fact that I wasn’t planning to upgrade my SSD anytime soon, I decided to go with Void Linux instead. I’d used Void before—it was stable and didn’t cause me any trouble.

The first thing I wanted was Hyprland, but surprise! It wasn’t in Void’s official repos. Turns out, it’s a philosophical thing. I’d heard about the Hyprland drama and all the criticisms of its lead developer, but honestly, I didn’t care. What I did care about was trying something that was in the repos.

I gave i3, awesome, and bspwm a shot, but configuring them to match my old setup turned out to be way harder than expected. Eventually, I gave up and added a third-party repo to install Hyprland. I copied over my old configs, but things didn’t quite work as before—fonts were missing, cursors weren’t behaving, and I was just too tired to troubleshoot.

## Settling with KDE

At that point, I decided to stop fighting and just install KDE. I’ve used KDE in the past, and it’s a solid choice—beautiful, feature-packed, and super customizable. But after using tiling window managers for so long, the lack of tiling felt weird.

That’s when I discovered Krohnkite, a KWin script that adds tiling support to KDE. It’s not perfect, but it’s good enough. So here I am, back on Void Linux, running KDE with Krohnkite. It’s not exactly what I had before, but it works, and honestly, I’m just happy to have a functional setup again.

For now, I’m staying put—probably. Let’s see how long this lasts!
