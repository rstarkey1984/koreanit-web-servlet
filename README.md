# 💻 한국IT교육원 웹 서버 프로그래밍 실습

> **주제:** JSP/Servlet 기반 웹 애플리케이션 개발 과정  
> **대상:** 한국IT교육원 웹 서버 프로그래밍 과정 수강생     
> **작성:** 류근철  

---

## 📚 강의 목차

### 1️⃣ 웹 기초 
1. [웹의 개념](10-web-basic/01-what-is-web.md)

2. [브라우저에서 `www.google.com` 을 입력했을 때의 전체 흐름](10-web-basic/02-web-flow.md)

### 2️⃣ WSL을 이용해 Ubuntu 서버 개발환경 구축 
1. [WSL로 리눅스 서버 개발환경 구축 ( WSL + Ubuntu + JDK ) ](20-ubuntu-web-server/01-wsl-setup.md)

2. [WSL Ubuntu 를 실제 개발서버 접속과 동일하게 구성하기](20-ubuntu-web-server/02-wsl-setup.md)
3. [웹 서버 구성하기 ( Nginx )](20-ubuntu-web-server/03-nginx-setup.md)
4. [웹 어플리케이션 서버 구성하기 ( Tomcat )](20-ubuntu-web-server/04-tomcat-setup.md)
5. [Ubuntu PATH(환경변수)의 역할 그리고 alias(별칭) 등록](20-ubuntu-web-server/05-ubuntu-setup.md)

### 3️⃣ Java Servlet/JSP
1. [Java Servlet / JSP 소개](30-java-examples/01-servlet-jsp-intro.md)

2. [Servlet에서 자주 사용하는 Java 기본 문법 정리](30-java-examples/02-servlet-java.md)
3. [Java Servlet 작동방식](30-java-examples/03-servlet-example.md)
4. [JSP 작동방식](30-java-examples/04-jsp-example.md)
5. [JSP/Servlet을 같이 사용하는 방법 실습](30-java-examples/05-jsp-servlet-example.md)
6. [Servlet Filter(필터) 와 Listener(리스너) 구현](30-java-examples/06-servlet-filter-listener.md)


### 4️⃣ MVC 구조 이해 + Servlet 구현 ( With MySQL )
1. [MySQL 설치 및 설정](40-mvc-project/01-mysql-setup.md)

2. [MVC (Model-View-Controller 패턴 소개)](40-mvc-project/02-what-is-mvc.md)
3. [MVC 구조 익히기 (Servlet + Service 구현)](40-mvc-project/03-servlet-mvc.md))
4. [Servlet API 로 CRUD 구현하기](40-mvc-project/04-servlet-api.md)

### 5️⃣ Vue 프론트엔드 + Servlet API 백엔드

1. Vue 프로젝트 초기 설정 및 개발 환경 구성

2. Axios 또는 Fetch를 이용한 API 연동 구조 잡기

3. 컴포넌트 기반 UI 개발 및 API 데이터 렌더링

4. API 데이터 목록, 상세, 등록/수정 화면 구현


## 🎯 학습 목표
- 웹의 기본 구조와 통신 원리를 이해한다.  
- Ubuntu 환경에서 Nginx와 Tomcat을 이용해 웹 서버를 구성한다.  
- Java Servlet/JSP를 이용하여 동적 웹페이지를 구현한다.  
- MySQL과 연동하여 CRUD 기능을 갖춘 API를 개발한다.  
- 개발환경 구축부터 서버 통신까지의 전체 흐름을 익힌다.  

---
## ⚙️ 준비물
| 구분 | 내용 |
|------|------|
| 운영체제 | Windows 10 (빌드 1903 이상) 또는 Windows 11 |
| 개발환경 | WSL2 + Ubuntu 24.04 LTS |
| 필수 도구 | JDK 17 이상, Nginx, Tomcat 10, MySQL 8 |
| 권장 에디터 | Visual Studio Code |
| 테스트 도구 | Insomnia 또는 curl |
