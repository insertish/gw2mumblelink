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
		HANDLE mapObj = NULL;
		inline void pushDataToBuffer(nbind::Buffer dest, wchar_t* src) {
			size_t length = dest.length();
			unsigned char *data = dest.data();
			if (!data || !length) return;
			for (size_t pos = 0; pos < length; ++pos) {
				data[pos] = src[pos];
			}
			dest.commit();
		}
		inline void pushDataToBuffer(nbind::Buffer dest, unsigned char* src) {
			size_t length = dest.length();
			unsigned char *data = dest.data();
			if (!data || !length) return;
			for (size_t pos = 0; pos < length; ++pos) {
				data[pos] = src[pos];
			}
			dest.commit();
		}
		inline void pushDataToBuffer(nbind::Buffer dest, float* src) {
			size_t length = dest.length();
			unsigned char *data = dest.data();
			if (!data || !length) return;
			for (size_t pos = 0; pos < length; ++pos) {
				int c = src[pos];
				data[pos] = c;
			}
			dest.commit();
		}
	public:
		inline bool init() {
			mapObj = CreateFileMappingW(INVALID_HANDLE_VALUE, NULL, PAGE_READWRITE, 0, sizeof(LinkedMem), L"MumbleLink");
			if (mapObj == NULL) return false;
			lm = (LinkedMem*)MapViewOfFile(mapObj, FILE_MAP_ALL_ACCESS, 0, 0, sizeof(LinkedMem));
			if (lm == NULL) {
				CloseHandle(mapObj);
				mapObj = NULL;
				return false;
			}
			return true; // We are now ready to recieve information.
		};
		inline UINT32 uiVersion() {
			return lm->uiVersion;
		}
		inline DWORD uiTick() {
			return lm->uiTick;
		}
		inline void getName(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->name);
		};
		inline void getDescription(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->description);
		};
		inline void getIdentity(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->identity);
		};
		inline int getContextLength() {
			return lm->context_len;
		}
		inline void getContext(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->context);
		};
		inline void getAvatarPosition(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->fAvatarPosition);
		};
		inline void getAvatarFront(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->fAvatarFront);
		};
		inline void getAvatarTop(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->fAvatarTop);
		};
		inline void getCameraPosition(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->fCameraPosition);
		};
		inline void getCameraFront(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->fCameraFront);
		};
		inline void getCameraTop(nbind::Buffer buf) {
			pushDataToBuffer(buf, lm->fCameraTop);
		};
		inline void close() {
			if (mapObj != NULL) CloseHandle(mapObj);
		};
};

#include "nbind/nbind.h"

NBIND_CLASS(MumbleLink) {
	construct<>();
	method(init);
	method(uiVersion);
	method(uiTick);
	method(getName);
	method(getDescription);
	method(getIdentity);
	method(getContext);
	method(getContextLength);
	method(getAvatarPosition);
	method(getAvatarFront);
	method(getAvatarTop);
	method(getCameraPosition);
	method(getCameraFront);
	method(getCameraTop);
	method(close);
};