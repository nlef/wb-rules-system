DESTDIR=/
dummy:
	echo


install:
	cp -a rules/* $(DESTDIR)/usr/share/wb-rules-system/rules
	cp -f wbmz2-battery.conf $(DESTDIR)/usr/share/wb-rules-system/wbmz2-battery.conf

.PHONY: dummy install
