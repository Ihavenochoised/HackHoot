{pkgs}: {
  deps = [
    pkgs.freetype
    pkgs.fontconfig
    pkgs.expat
    pkgs.dbus
    pkgs.glib
    pkgs.cairo
    pkgs.pango
    pkgs.xorg.libXi
    pkgs.xorg.libXcursor
    pkgs.xorg.libXrandr
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcomposite
    pkgs.cups
    pkgs.atk
    pkgs.nss
    pkgs.chromium
  ];
}
