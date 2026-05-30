# 글로닉스 이민법인 — 공식 홈페이지

미국 이민 전문 법인 **글로닉스(GLONIX)** 의 반응형 정적 웹사이트입니다.
빌드 도구 없이 순수 **HTML · CSS · 바닐라 JS** 로 작성되어 Netlify(또는 Cloudflare Pages)에 그대로 배포됩니다.

## 디렉터리 구조

```
/
├── index.html                # 메인 랜딩
├── about/index.html          # 법인소개
├── services/
│   ├── eb-5/  niw/  eb-3/
│   ├── nurse/ family/ nonimmigrant/   # 각 index.html
├── contact/index.html        # 1:1 상담 신청
├── privacy/index.html        # 개인정보 처리방침
├── 404.html                  # 404 페이지
├── assets/
│   ├── css/styles.css        # 디자인 토큰 + 전체 스타일
│   ├── js/main.js            # 헤더·드로어·리빌·탭·아코디언·캐러셀
│   ├── js/contact.js         # 상담폼 검증/제출
│   └── logo.png
├── images/                   # 실사(WebP+JPG) · OG 이미지
├── favicon.svg · apple-touch-icon.png
├── glonix-onepage.html       # 홈을 1개 파일로 묶은 자체완결 버전(선택)
├── netlify.toml · _headers · robots.txt · sitemap.xml
```

## 로컬 미리보기

```bash
python3 -m http.server 8765
# http://localhost:8765/
```

## Netlify 배포

### 방법 A — GitHub 연동(권장, 자동 배포)
1. 이 저장소를 GitHub에 푸시합니다.
2. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project → GitHub** 선택.
3. 이 저장소 선택. 빌드 설정은 자동 인식됩니다:
   - **Build command:** (비움)
   - **Publish directory:** `.`
4. Deploy 클릭 → `main` 브랜치에 푸시할 때마다 자동 재배포됩니다.

### 방법 B — 드래그 앤 드롭(빠른 테스트)
[app.netlify.com/drop](https://app.netlify.com/drop) 에 이 폴더를 끌어다 놓으면 즉시 배포됩니다.

### 커스텀 도메인
Netlify 사이트 설정 → **Domain management** 에서 `www.glonix.co.kr` 연결.
(`sitemap.xml`·canonical·OG 태그는 해당 도메인 기준으로 작성되어 있습니다.)

## 참고 / 남은 TODO
- 폰트: 현재 CDN(Pretendard · Noto Serif KR). 추후 self-host 서브셋 적용 권장.
- 오시는 길 지도: 키 불필요 구글 지도 임베드. 카카오맵 전환 시 API 키 필요.
- 플레이스홀더: 구성원 사진·약력, 카카오톡 채널 URL, 상담폼 메일/CRM 연동(`assets/js/contact.js`), `/privacy` 정식 약관.
- 법령·판례·서식·수치는 `01_copy.md` 원문 그대로이며 임의 변경 금지.
