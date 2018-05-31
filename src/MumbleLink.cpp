#include <stdio.h>
#include <iostream>
#include <locale>
#include <stdint.h>
// weird stuff happens with nbind, include line below to prevent redefinitions
#define _WINSOCKAPI_
#include <Windows.h>
#include "nbind/api.h"

class MumbleLink {
	private:
		struct LinkedMem {
			UINT32	uiVersion;
			DWORD	uiTick;
			float	fAvatarPosition[3];
			float	fAvatarFront[3];
			float	fAvatarTop[3];
			wchar_t	name[256];
			float	fCameraPosition[3];
			float	fCameraFront[3];
			float	fCameraTop[3];
			wchar_t	identity[256];
			UINT32	context_len;
			unsigned char context[256];
			wchar_t description[2048];
		};
		LinkedMem *lm = NULL;
		inline void pushDataToBuffer(nbind::Buffer dest, wchar_t* src) {
			size_t length = dest.length();
			unsigned char *data = dest.data();
			if (!data || !length) return;
			for (size_t pos = 0; pos < length; ++pos) {
				data[pos] = src[pos];
			}
			dest.commit();
		}
	public:
		inline bool init() {
			HANDLE mapObj = CreateFileMappingW(INVALID_HANDLE_VALUE, NULL, PAGE_READWRITE, 0, sizeof(LinkedMem), L"MumbleLink");
			if (mapObj == NULL) return false;
			lm = (LinkedMem*)MapViewOfFile(mapObj, FILE_MAP_ALL_ACCESS, 0, 0, sizeof(LinkedMem));
			if (lm == NULL) {
				CloseHandle(mapObj);
				mapObj = NULL;
				return false;
			}
			return true; // We are now ready to recieve information.
		};
		inline void getName(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->name);
		};
		inline void getIdentity(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->identity);
		};
};

#include "nbind/nbind.h"

NBIND_CLASS(MumbleLink) {
	construct<>();
	method(init);
	method(getName);
	method(getIdentity);
};